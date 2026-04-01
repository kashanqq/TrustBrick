import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import { expect } from "chai";

describe("TrustBrick Escrow Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;

  const admin = anchor.web3.Keypair.generate();
  const builder = anchor.web3.Keypair.generate();
  const investor = anchor.web3.Keypair.generate();

  const projectId = new anchor.BN(1);

  const [buildingProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"), 
      projectId.toArrayLike(Buffer, "le", 8)
    ],
    program.programId
  );

  before(async () => {
    const airdropAmount = 10 * anchor.web3.LAMPORTS_PER_SOL; 
    await Promise.all([
      provider.connection.requestAirdrop(admin.publicKey, airdropAmount),
      provider.connection.requestAirdrop(builder.publicKey, airdropAmount),
      provider.connection.requestAirdrop(investor.publicKey, airdropAmount),
    ]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("1. Инициализирует стройку (Сейф создан)", async () => {
    await program.methods
      .initialize(projectId, builder.publicKey)
      .accounts({
        admin: admin.publicKey,
        // buildingProject и systemProgram Anchor подставит автоматически
      })
      .signers([admin])
      .rpc();

    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);

    expect(accountData.admin.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(accountData.builder.toBase58()).to.equal(builder.publicKey.toBase58());
    expect(accountData.totalInvested.toNumber()).to.equal(0);
    expect(accountData.releasedAmount.toNumber()).to.equal(0); // Проверяем новое поле
    expect(accountData.stage).to.equal(0);
    expect(accountData.projectId.toNumber()).to.equal(1);
    
    console.log("Сейф успешно проинициализирован");
  });

  it("2. Инвестор заносит деньги (Invest)", async () => {
    const investAmount = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL); 

    await program.methods
      .invest(projectId, investAmount)
      .accounts({
        investor: investor.publicKey,
      })
      .signers([investor])
      .rpc();

    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);
    expect(accountData.totalInvested.toString()).to.equal(investAmount.toString());

    const pdaBalance = await provider.connection.getBalance(buildingProjectPda);
    expect(pdaBalance).to.be.at.least(investAmount.toNumber()); 
    
    console.log(`Инвестор занес 5 SOL. Сейф имеет стейт: ${accountData.totalInvested.toString()}`);
  });

  it("3. Оракул (Админ) переводит первый транш застройщику (Release Funds)", async () => {
    const builderBalanceBefore = await provider.connection.getBalance(builder.publicKey);

    // Удален releaseAmount из вызова, контракт высчитывает сумму сам
    await program.methods
      .releaseFunds(projectId)
      .accounts({
        admin: admin.publicKey,
        builder: builder.publicKey,
      })
      .signers([admin])
      .rpc();

    const builderBalanceAfter = await provider.connection.getBalance(builder.publicKey);
    const expectedRelease = 1 * anchor.web3.LAMPORTS_PER_SOL; // 20% от 5 SOL = 1 SOL
    
    expect(builderBalanceAfter - builderBalanceBefore).to.equal(expectedRelease);

    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);
    expect(accountData.stage).to.equal(1);
    expect(accountData.releasedAmount.toNumber()).to.equal(expectedRelease);
    
    console.log(`Застройщик успешно получил транш! Этап стройки перешел на уровень: ${accountData.stage}`);
  });
  
  it("4. Неизвестный человек не может украсть деньги", async () => {
    try {
      await program.methods
        .releaseFunds(projectId) // Контракт сам решит, что отдать, если бы подпись прошла
        .accounts({
          admin: investor.publicKey, // Подмена!
          builder: builder.publicKey,
        })
        .signers([investor])
        .rpc();
        
      expect.fail("Транзакция должна была упасть, но не упала!");
    } catch (err: any) {
      expect(err.message).to.include("Unauthorized");
      console.log("   ✅ Ошибка подтверждена: только Админ может отпирать сейф!");
    }
  });
});