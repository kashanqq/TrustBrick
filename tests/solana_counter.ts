import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaCounter } from "../target/types/solana_counter";
import { expect } from "chai";

describe("TrustBrick Escrow Tests", () => {
  // Настраиваем провайдера (подключение к локальному тест-валидатору)
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaCounter as Program<SolanaCounter>;

  // Создаем тестовых участников (Keypairs)
  const admin = anchor.web3.Keypair.generate();
  const builder = anchor.web3.Keypair.generate();
  const investor = anchor.web3.Keypair.generate();

  // Уникальный ID нашей стройки
  const projectId = new anchor.BN(1);

  // Вычисляем адрес "Сейфа" (PDA)
  // Seeds: [b"escrow", project_id.to_le_bytes()]
  const [buildingProjectPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"), 
      projectId.toArrayLike(Buffer, "le", 8) // u64 в виде little-endian байтов
    ],
    program.programId
  );

  before(async () => {
    // Выдаем бесплатные тестовые SOL для оплаты транзакций
    const airdropAmount = 10 * anchor.web3.LAMPORTS_PER_SOL; // 10 SOL каждому
    await Promise.all([
      provider.connection.requestAirdrop(admin.publicKey, airdropAmount),
      provider.connection.requestAirdrop(builder.publicKey, airdropAmount),
      provider.connection.requestAirdrop(investor.publicKey, airdropAmount),
    ]);
    
    // Ждем подтверждения эйрдропов
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  it("1. Инициализирует стройку (Сейф создан)", async () => {
    // Админ вызывает функцию
    await program.methods
      .initialize(projectId, builder.publicKey)
      .accounts({
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    // Загружаем стейт сейфа и проверяем
    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);

    expect(accountData.admin.toBase58()).to.equal(admin.publicKey.toBase58());
    expect(accountData.builder.toBase58()).to.equal(builder.publicKey.toBase58());
    expect(accountData.totalInvested.toNumber()).to.equal(0);
    expect(accountData.stage).to.equal(0);
    expect(accountData.projectId.toNumber()).to.equal(1);
    
    console.log("   ✅ Сейф успешно проинициализирован");
  });

  it("2. Инвестор заносит деньги (Invest)", async () => {
    const investAmount = new anchor.BN(5 * anchor.web3.LAMPORTS_PER_SOL); // 5 SOL

    await program.methods
      .invest(projectId, investAmount)
      .accounts({
        investor: investor.publicKey,
      })
      .signers([investor])
      .rpc();

    // Проверяем, что счетчик инвестиций в сейфе увеличился
    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);
    expect(accountData.totalInvested.toString()).to.equal(investAmount.toString());

    // Физически проверяем баланс PDA в сети
    const pdaBalance = await provider.connection.getBalance(buildingProjectPda);
    expect(pdaBalance).to.be.at.least(investAmount.toNumber()); // at least, т.к. были еще лампорты на ренту
    
    console.log(`   ✅ Инвестор занес 5 SOL. Сейф имеет стейт: ${accountData.totalInvested.toString()}`);
  });

  it("3. Оракул (Админ) переводит первый транш застройщику (Release Funds)", async () => {
    // Узнаем баланс застройщика ДО перевода
    const builderBalanceBefore = await provider.connection.getBalance(builder.publicKey);

    // Выделяем 1 SOL как первый транш
    const releaseAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL); 

    await program.methods
      .releaseFunds(projectId, releaseAmount)
      .accounts({
        admin: admin.publicKey,
        builder: builder.publicKey,
      })
      .signers([admin])
      .rpc();

    // Баланс застройщика ПОСЛЕ
    const builderBalanceAfter = await provider.connection.getBalance(builder.publicKey);
    
    // Проверяем, что застройщик реально получил +1 SOL
    expect(builderBalanceAfter - builderBalanceBefore).to.equal(releaseAmount.toNumber());

    // Проверяем, что этап (stage) увеличился
    const accountData = await program.account.buildingProject.fetch(buildingProjectPda);
    expect(accountData.stage).to.equal(1);
    
    console.log(`   ✅ Застройщик успешно получил транш! Этап стройки перешел на уровень: ${accountData.stage}`);
  });
  
  it("4. Неизвестный человек не может украсть деньги", async () => {
    // Пытаемся вызвать releaseFunds от лица левого человека (investor) вместо admin
    const releaseAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL); 
    
    try {
      await program.methods
        .releaseFunds(projectId, releaseAmount)
        .accounts({
          admin: investor.publicKey, // Подмена!
          builder: builder.publicKey,
        })
        .signers([investor])
        .rpc();
        
      // Если код дошел сюда - это провал
      expect.fail("Транзакция должна была упасть, но не упала!");
    } catch (err) {
      // Ожидаем кастомную ошибку EscrowError::Unauthorized
      expect(err.message).to.include("Unauthorized");
      console.log("   ✅ Ошибка подтверждена: только Админ может отпирать сейф!");
    }
  });
});