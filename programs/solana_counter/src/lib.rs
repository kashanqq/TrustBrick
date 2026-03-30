use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("8d69hCAymRKqXviPGLvTfesZnpJTpt1oLdiSwwV51c4U");

#[program]
pub mod solana_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, project_id: u64, builder: Pubkey) -> Result<()> {
        let building_project = &mut ctx.accounts.building_project;
        building_project.admin = ctx.accounts.admin.key();
        building_project.builder = builder;
        building_project.total_invested = 0;
        building_project.stage = 0;
        building_project.project_id = project_id;
        
        msg!("Building project initialized with ID: {}", project_id);
        Ok(())
    }

    pub fn invest(ctx: Context<Invest>, project_id: u64, amount: u64) -> Result<()> {
        let building_project = &mut ctx.accounts.building_project;
        
        // Перевод SOL от инвестора в наш PDA-сейф
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.investor.to_account_info(),
                to: building_project.to_account_info(),
            },
        );
        transfer(cpi_context, amount)?;

        // Обновляем счетчик
        building_project.total_invested = building_project.total_invested.checked_add(amount).unwrap();
        
        msg!("Invested {} lamports into project ID: {}", amount, project_id);
        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>, project_id: u64, release_amount: u64) -> Result<()> {
        let building_project = &mut ctx.accounts.building_project;
        let builder = &mut ctx.accounts.builder;

        // Отщипываем сумму от PDA и переводим застройщику напрямую (через изменение lamports)
        **building_project.to_account_info().try_borrow_mut_lamports()? = building_project
            .to_account_info()
            .lamports()
            .checked_sub(release_amount)
            .ok_or(EscrowError::InsufficientFunds)?;

        **builder.try_borrow_mut_lamports()? = builder
            .lamports()
            .checked_add(release_amount)
            .unwrap();

        // Увеличиваем счетчик этапа стройки
        building_project.stage = building_project.stage.checked_add(1).unwrap();

        msg!("Released {} lamports to builder for project ID: {}. Stage is now: {}", release_amount, project_id, building_project.stage);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + BuildingProject::INIT_SPACE,
        seeds = [b"escrow", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub building_project: Account<'info, BuildingProject>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct Invest<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub building_project: Account<'info, BuildingProject>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", project_id.to_le_bytes().as_ref()],
        bump,
        has_one = admin @ EscrowError::Unauthorized,
        has_one = builder @ EscrowError::InvalidBuilder
    )]
    pub building_project: Account<'info, BuildingProject>,

    /// CHECK: Это кошелек застройщика, куда отправятся деньги. Проверка проходит через макрос has_one (builder).
    #[account(mut)]
    pub builder: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// Структура Слоя 1 (Состояние PDA-аккаунта)
#[account]
#[derive(InitSpace)]
pub struct BuildingProject {
    pub admin: Pubkey,       // 32 байта
    pub builder: Pubkey,     // 32 байта
    pub total_invested: u64, // 8 байт
    pub stage: u8,           // 1 байт
    pub project_id: u64,     // 8 байт
}

#[error_code]
pub enum EscrowError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("The provided builder account does not match the project's builder.")]
    InvalidBuilder,
    #[msg("Insufficient funds in the escrow PDA to release the requested amount.")]
    InsufficientFunds,
}
