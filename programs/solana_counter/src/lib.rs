use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use anchor_spl::token::{self, CloseAccount, Token, TokenAccount, Transfer as SplTransfer};


declare_id!("4Acsi2H93uxQq6gEANgBMxiZu9MP2VSxZV6uBRAiTXSs");

#[program]
pub mod trustbrick {
    use super::*;

    /// 1. Инициализация проекта (Создание "сейфа" для SOL и метаданных)
    pub fn initialize(ctx: Context<Initialize>, project_id: u64, builder: Pubkey) -> Result<()> {
        let building_project = &mut ctx.accounts.building_project;
        building_project.admin = ctx.accounts.admin.key();
        building_project.builder = builder;
        building_project.total_invested = 0;
        building_project.released_amount = 0;
        building_project.stage = 0;
        building_project.project_id = project_id;
        
        msg!("Проект TrustBrick инициализирован. ID: {}", project_id);
        Ok(())
    }

    /// 2. Ивестирование: Инвестор отправляет SOL в PDA-сейф проекта
    pub fn invest(ctx: Context<Invest>, project_id: u64, amount: u64) -> Result<()> {
        let building_project = &mut ctx.accounts.building_project;
        
        // Если проект не был инициализирован (project_id == 0 по умолчанию)
        if building_project.project_id == 0 {
            building_project.project_id = project_id;
            building_project.stage = 0;
            building_project.total_invested = 0;
            building_project.released_amount = 0;
        }

        // Запрещаем покупки, если проект завершен (5 этапов пройдено)
        require!(building_project.stage < 5, EscrowError::ProjectCompleted);

        // --- А. Перевод SOL от инвестора в PDA-сейф ---
        let cpi_context_sol = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.investor.to_account_info(),
                to: building_project.to_account_info(),
            },
        );
        transfer(cpi_context_sol, amount)?;

        // Обновляем общую сумму инвестиций в SOL
        building_project.total_invested = building_project.total_invested.checked_add(amount).unwrap();
        
        msg!("Инвестор проинвестировал {} лампортов. Всего в сейфе: {}", amount, building_project.total_invested);
        Ok(())
    }

    /// 3. Выплата транша (Только для Админа/Оракула)
    pub fn release_funds(ctx: Context<ReleaseFunds>, _project_id: u64) -> Result<()> {
        let building_project = &mut ctx.accounts.building_project;
        let builder = &mut ctx.accounts.builder;

        require!(building_project.stage < 5, EscrowError::ProjectCompleted);

        let target_stage = building_project.stage.checked_add(1).unwrap();
        
        // Математика траншей: (Всего_собрано * Номер_Этапа) / 5
        let target_total_release = (building_project.total_invested as u128)
            .checked_mul(target_stage as u128).unwrap()
            .checked_div(5).unwrap() as u64;

        // Сколько выплатить сейчас = Цель к этому моменту - Уже выплачено
        let release_amount = target_total_release
            .checked_sub(building_project.released_amount)
            .ok_or(EscrowError::MathOverflow)?;

        require!(release_amount > 0, EscrowError::InsufficientFunds);

        // --- Перевод SOL со счета PDA застройщику ---
        **building_project.to_account_info().try_borrow_mut_lamports()? = building_project
            .to_account_info().lamports().checked_sub(release_amount).unwrap();
        
        **builder.try_borrow_mut_lamports()? = builder
            .lamports().checked_add(release_amount).unwrap();

        // Обновляем стейт проекта
        building_project.released_amount = building_project.released_amount.checked_add(release_amount).unwrap();
        building_project.stage = target_stage;

        msg!("Выплачен транш №{}: {} лампортов", building_project.stage, release_amount);
        Ok(())
    }
    /// P2P Выставить токены на продажу
    pub fn list_token(ctx: Context<ListToken>, amount: u64, price: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.token_mint = ctx.accounts.mint.key();
        listing.payment_mint = ctx.accounts.payment_mint.key();
        listing.amount = amount;
        listing.price = price;

        // Переводим токены продавца в P2P-сейф (PDA)
        let cpi_accounts = SplTransfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.p2p_escrow_wallet.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        msg!("Токены выставлены на продажу. Цена: {}", price);
        Ok(())
    }

    /// Купить токены с рынка
    pub fn buy_from_market(ctx: Context<BuyFromMarket>) -> Result<()> {
        let listing = &ctx.accounts.listing;

        // 1. Покупатель переводит токены оплаты (например, USDC) продавцу
        let cpi_accounts_payment = SplTransfer {
            from: ctx.accounts.buyer_payment_token_account.to_account_info(),
            to: ctx.accounts.seller_payment_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts_payment), listing.price)?;

        // 2. Контракт переводит токены из P2P-сейфа покупателю
        let bump_bytes = [ctx.bumps.p2p_escrow_wallet];
        let seeds = &[
            b"p2p_escrow".as_ref(),
            listing.to_account_info().key.as_ref(),
            bump_bytes.as_ref(),
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts_tokens = SplTransfer {
            from: ctx.accounts.p2p_escrow_wallet.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.p2p_escrow_wallet.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts_tokens,
                signer,
            ),
            listing.amount,
        )?;

        // Закрываем пустой токен-аккаунт PDA, чтобы вернуть rent за него (лампорты) продавцу
        let cpi_accounts_close = CloseAccount {
            account: ctx.accounts.p2p_escrow_wallet.to_account_info(),
            destination: ctx.accounts.seller.to_account_info(),
            authority: ctx.accounts.p2p_escrow_wallet.to_account_info(),
        };
        token::close_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts_close,
                signer,
            )
        )?;

        Ok(())
    }
}

// (Accounts) 

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
        init_if_needed,
        payer = investor,
        space = 8 + BuildingProject::INIT_SPACE,
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
        bump
    )]
    pub building_project: Account<'info, BuildingProject>,

    /// CHECK: Кошелек застройщика
    #[account(mut)]
    
    pub builder: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
// АККАУНТЫ ДЛЯ P2P

#[derive(Accounts)]
pub struct ListToken<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut, token::mint = mint)]
    pub seller_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, anchor_spl::token::Mint>,
    pub payment_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(
        init, 
        payer = seller, 
        space = 8 + MarketListing::INIT_SPACE
    )]
    pub listing: Account<'info, MarketListing>,
    #[account(
        init,
        payer = seller,
        seeds = [b"p2p_escrow", listing.key().as_ref()],
        bump,
        token::mint = mint,
        token::authority = p2p_escrow_wallet,
    )]
    pub p2p_escrow_wallet: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyFromMarket<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Продавец лота
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    #[account(
        mut, 
        close = seller, 
        has_one = seller
    )]
    pub listing: Account<'info, MarketListing>,
    #[account(
        mut,
        seeds = [b"p2p_escrow", listing.key().as_ref()],
        bump,
    )]
    pub p2p_escrow_wallet: Account<'info, TokenAccount>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut, token::mint = listing.payment_mint)]
    pub buyer_payment_token_account: Account<'info, TokenAccount>,
    #[account(mut, token::mint = listing.payment_mint, token::authority = seller)]
    pub seller_payment_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
// ПЕРВИЧНЫЙ РЫНОК (Глобальный профиль стройки)
#[account]
#[derive(InitSpace)]
pub struct BuildingProject {
    pub admin: Pubkey,
    pub builder: Pubkey,
    pub total_invested: u64,
    pub released_amount: u64,// отслеживание выплаченного
    pub stage: u8,
    pub project_id: u64,
}
// ВТОРИЧНЫЙ РЫНОК (Разовое объявление от пользователя)
#[account]
#[derive(InitSpace)]
pub struct MarketListing {
    pub seller: Pubkey,
    pub token_mint: Pubkey,
    pub payment_mint: Pubkey,
    pub amount: u64,
    pub price: u64,
}

#[error_code]
pub enum EscrowError {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("The provided builder account does not match the project's builder.")]
    InvalidBuilder,
    #[msg("Insufficient funds in the escrow PDA to release the requested amount.")]
    InsufficientFunds,
    #[msg("The project has already reached maximum completion stage.")]
    ProjectCompleted,
    #[msg("Calculation overflow error.")]
    MathOverflow,
}