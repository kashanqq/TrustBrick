import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Trustbrick } from "../target/types/trustbrick";
import { expect } from "chai";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";

describe("TrustBrick Escrow Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Trustbrick as Program<Trustbrick>;

  const admin = anchor.web3.Keypair.generate();
  const builder = anchor.web3.Keypair.generate();
  const investor = anchor.web3.Keypair.generate();
  const buyer = anchor.web3.Keypair.generate(); // for P2P market
  
  const projectId = new anchor.BN(1);

  const [buildingProjectPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"), 
      projectId.toArrayLike(Buffer, "le", 8)
    ],
    program.programId
  );

  let mint: anchor.web3.PublicKey;
  let pdaTokenInventory: anchor.web3.PublicKey;
  let investorTokenAccount: anchor.web3.PublicKey;
  let buyerTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    // В тестах Anchor локальный валидатор сразу готов.
    const airdropAmount = 10 * anchor.web3.LAMPORTS_PER_SOL; 
    await Promise.all([
      provider.connection.requestAirdrop(admin.publicKey, airdropAmount),
      provider.connection.requestAirdrop(builder.publicKey, airdropAmount),
      provider.connection.requestAirdrop(investor.publicKey, airdropAmount),
      provider.connection.requestAirdrop(buyer.publicKey, airdropAmount),
    ]);
    
    // Ждем подтверждения эйрдропа
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Создаем токен ASTANA_BRICK
    mint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      9
    );

    // Создаем Token Account для PDA
    const pdaInventoryKeypair = anchor.web3.Keypair.generate();
    pdaTokenInventory = await createAccount(
      provider.connection,
      admin,
      mint,
      buildingProjectPda,
      pdaInventoryKeypair
    );

    // Выпускаем токены на PDA (например 1,000,000)
    await mintTo(
      provider.connection,
      admin,
      mint,
      pdaTokenInventory,
      admin,
      1_000_000 * (10 ** 9)
    );

    // Создаем TokenAccount для инвестора 
    const investorInventoryKeypair = anchor.web3.Keypair.generate();
    investorTokenAccount = await createAccount(
      provider.connection,
      admin,
      mint,
      investor.publicKey,
      investorInventoryKeypair
    );

    // TokenAccount для покупателя
    const buyerInventoryKeypair = anchor.web3.Keypair.generate();
    buyerTokenAccount = await createAccount(
      provider.connection,
      admin,
      mint,
      buyer.publicKey,
      buyerInventoryKeypair
    );
  });

  it("1. Инициализирует стройку (Сейф создан)", async () => {
    await program.methods
      .initialize(projectId, builder.publicKey)
      .accounts({
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);

    expect(accountData.admin.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(accountData.builder.toBase58()).to.equal(builder.publicKey.toBase58());
    expect(accountData.totalInvested.toNumber()).to.equal(0);
    expect(accountData.releasedAmount.toNumber()).to.equal(0);
    expect(accountData.stage).to.equal(0);
    expect(accountData.projectId.toNumber()).to.equal(1);
    
    console.log("Сейф успешно проинициализирован");
  });

  it("2. Инвестор покупает доли (Buy Shares)", async () => {
    // 5 SOL
    const investAmount = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL); 

    await program.methods
      .buyShares(projectId, investAmount)
      .accounts({
        investor: investor.publicKey,
        pdaTokenInventory: pdaTokenInventory,
        investorTokenAccount: investorTokenAccount,
      })
      .signers([investor])
      .rpc();

    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);
    expect(accountData.totalInvested.toString()).to.equal(investAmount.toString());

    const pdaBalance = await provider.connection.getBalance(buildingProjectPda);
    // На PDA может быть баланс аренды + наши инвестиции
    expect(pdaBalance).to.be.at.least(investAmount.toNumber()); 

    // Проверяем токены у инвестора
    const investorTokensInfo = await getAccount(provider.connection, investorTokenAccount);
    // Курс 1 SOL = 100 токенов (в минимальных единицах)
    const expectedTokens = BigInt(investAmount.toNumber() * 100);
    expect(investorTokensInfo.amount).to.equal(expectedTokens);
    
    console.log(`Инвестор занес 5 SOL. Токенов: ${investorTokensInfo.amount}`);
  });

  it("3. Админ переводит первый транш застройщику (Release Funds)", async () => {
    const builderBalanceBefore = await provider.connection.getBalance(builder.publicKey);

    await program.methods
      .releaseFunds(projectId)
      .accounts({
        admin: admin.publicKey,
        builder: builder.publicKey,
      })
      .signers([admin])
      .rpc();

    const builderBalanceAfter = await provider.connection.getBalance(builder.publicKey);
    // 1 этап из 5 = 20% от 5 SOL = 1 SOL
    const expectedRelease = 1 * anchor.web3.LAMPORTS_PER_SOL; 
    
    expect(builderBalanceAfter - builderBalanceBefore).to.equal(expectedRelease);

    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);
    expect(accountData.stage).to.equal(1);
    expect(accountData.releasedAmount.toNumber()).to.equal(expectedRelease);
  });

  it("4. Неизвестный человек не может выпустить средства (Отказ подписи)", async () => {
    try {
      await program.methods
        .releaseFunds(projectId)
        .accounts({
          admin: investor.publicKey, // Подмена
          builder: builder.publicKey,
        })
        .signers([investor])
        .rpc();
        
      expect.fail("Транзакция должна была упасть, но не упала!");
    } catch (err: any) {
      expect(err.message).to.include("Unauthorized");
    }
  });

  let p2pListingPda: anchor.web3.PublicKey;
  let listingKeypair: anchor.web3.Keypair;

  it("5. Инвестор выставляет токены на продажу P2P (List Token)", async () => {
    listingKeypair = anchor.web3.Keypair.generate();
    p2pListingPda = listingKeypair.publicKey;

    // Выставляем 10 токенов
    const amountToList = new anchor.BN(10 * 10**9);
    // За цену 0.1 SOL
    const priceInSol = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);

    const [p2pEscrowWalletPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("p2p_escrow"), p2pListingPda.toBuffer()],
      program.programId
    );

    await program.methods
      .listToken(amountToList, priceInSol)
      .accounts({
        seller: investor.publicKey,
        sellerTokenAccount: investorTokenAccount,
        mint: mint,
        listing: p2pListingPda,
      })
      .signers([investor, listingKeypair])
      .rpc();

    // Проверяем что токены переведены
    const escrowTokenInfo = await getAccount(provider.connection, p2pEscrowWalletPda);
    expect(escrowTokenInfo.amount).to.equal(BigInt(amountToList.toNumber()));
  });

  it("6. Покупатель выкупает токены с P2P (Buy From Market)", async () => {
    const listingDataBefore = await program.account.marketListing.fetch(p2pListingPda);
    
    const [p2pEscrowWalletPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("p2p_escrow"), p2pListingPda.toBuffer()],
      program.programId
    );

    await program.methods
      .buyFromMarket()
      .accounts({
        buyer: buyer.publicKey,
        listing: p2pListingPda,
        buyerTokenAccount: buyerTokenAccount,
      })
      .signers([buyer])
      .rpc();

    // Проверяем, что токены пришли покупателю
    const buyerTokenInfo = await getAccount(provider.connection, buyerTokenAccount);
    expect(buyerTokenInfo.amount).to.equal(BigInt(listingDataBefore.amount.toNumber()));
    
    // Проверяем, что аккаунт листинга удалился
    try {
      await program.account.marketListing.fetch(p2pListingPda);
      expect.fail("Listing should have been closed");
    } catch (e) {
      // Account does not exist
      expect(e.message).to.not.equal("Listing should have been closed");
    }
  });

});