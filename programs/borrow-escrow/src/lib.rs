use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("BorrEscrow111111111111111111111111111111111");

#[program]
pub mod borrow_escrow {
    use super::*;

    /// Initialize and fund the rental escrow.
    /// The borrower deposits:
    /// - rental_amount_lamports: payout destined for lender upon successful return
    /// - deposit_amount_lamports: refundable security deposit for borrower
    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        booking_id: String,
        rental_amount_lamports: u64,
        deposit_amount_lamports: u64,
    ) -> Result<()> {
        require!(booking_id.len() <= 64, EscrowError::BookingIdTooLong);
        require!(rental_amount_lamports > 0, EscrowError::InvalidRentalAmount);
        
        let total_lamports = rental_amount_lamports
            .checked_add(deposit_amount_lamports)
            .ok_or(EscrowError::MathOverflow)?;

        // Transfer funds from borrower to the escrow PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.borrower.to_account_info(),
                to: ctx.accounts.escrow_account.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, total_lamports)?;

        let escrow = &mut ctx.accounts.escrow_account;
        escrow.booking_id = booking_id.clone();
        escrow.borrower = ctx.accounts.borrower.key();
        escrow.lender = ctx.accounts.lender.key();
        escrow.arbiter = ctx.accounts.arbiter.key();
        escrow.rental_amount_lamports = rental_amount_lamports;
        escrow.deposit_amount_lamports = deposit_amount_lamports;
        escrow.state = EscrowState::Funded;
        escrow.bump = ctx.bumps.escrow_account;
        escrow.created_at = Clock::get()?.unix_timestamp;

        emit!(EscrowCreatedEvent {
            booking_id,
            borrower: escrow.borrower,
            lender: escrow.lender,
            rental_amount_lamports,
            deposit_amount_lamports,
            timestamp: escrow.created_at,
        });

        Ok(())
    }

    /// Handover acknowledgement: borrower confirms physical possession and condition.
    pub fn confirm_handover(ctx: Context<ConfirmHandover>, booking_id: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.booking_id == booking_id, EscrowError::BookingMismatch);
        require!(escrow.state == EscrowState::Funded, EscrowError::InvalidStateTransition);
        require!(ctx.accounts.signer.key() == escrow.borrower, EscrowError::Unauthorized);

        escrow.state = EscrowState::HandedOver;

        emit!(HandoverConfirmedEvent {
            booking_id,
            borrower: escrow.borrower,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Return acknowledgement & settlement:
    /// Lender confirms physical return of the item in good order.
    /// - Escrow releases rental payout to lender.
    /// - Escrow refunds deposit back to borrower.
    pub fn complete_return(ctx: Context<CompleteReturn>, booking_id: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.booking_id == booking_id, EscrowError::BookingMismatch);
        require!(escrow.state == EscrowState::HandedOver, EscrowError::InvalidStateTransition);
        require!(ctx.accounts.signer.key() == escrow.lender, EscrowError::Unauthorized);

        let rental_payout = escrow.rental_amount_lamports;
        let deposit_refund = escrow.deposit_amount_lamports;

        // Perform balance transfers from PDA to lender and borrower
        **escrow.to_account_info().try_borrow_mut_lamports()? = escrow
            .to_account_info()
            .lamports()
            .checked_sub(rental_payout)
            .ok_or(EscrowError::MathOverflow)?
            .checked_sub(deposit_refund)
            .ok_or(EscrowError::MathOverflow)?;

        **ctx.accounts.lender.try_borrow_mut_lamports()? = ctx
            .accounts
            .lender
            .lamports()
            .checked_add(rental_payout)
            .ok_or(EscrowError::MathOverflow)?;

        **ctx.accounts.borrower.try_borrow_mut_lamports()? = ctx
            .accounts
            .borrower
            .lamports()
            .checked_add(deposit_refund)
            .ok_or(EscrowError::MathOverflow)?;

        escrow.state = EscrowState::Completed;

        emit!(EscrowCompletedEvent {
            booking_id,
            rental_payout,
            deposit_refund,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Cancel and refund before physical handover has occurred.
    pub fn cancel_booking(ctx: Context<CancelBooking>, booking_id: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.booking_id == booking_id, EscrowError::BookingMismatch);
        require!(escrow.state == EscrowState::Funded, EscrowError::InvalidStateTransition);
        
        let signer = ctx.accounts.signer.key();
        require!(
            signer == escrow.borrower || signer == escrow.lender || signer == escrow.arbiter,
            EscrowError::Unauthorized
        );

        let total_refund = escrow
            .rental_amount_lamports
            .checked_add(escrow.deposit_amount_lamports)
            .ok_or(EscrowError::MathOverflow)?;

        **escrow.to_account_info().try_borrow_mut_lamports()? = escrow
            .to_account_info()
            .lamports()
            .checked_sub(total_refund)
            .ok_or(EscrowError::MathOverflow)?;

        **ctx.accounts.borrower.try_borrow_mut_lamports()? = ctx
            .accounts
            .borrower
            .lamports()
            .checked_add(total_refund)
            .ok_or(EscrowError::MathOverflow)?;

        escrow.state = EscrowState::Cancelled;

        emit!(EscrowRefundedEvent {
            booking_id,
            refund_amount: total_refund,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Open dispute: locks funds until resolved by authorized arbiter / mutual agreement.
    pub fn raise_dispute(ctx: Context<RaiseDispute>, booking_id: String, reason: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.booking_id == booking_id, EscrowError::BookingMismatch);
        require!(
            escrow.state == EscrowState::HandedOver || escrow.state == EscrowState::Funded,
            EscrowError::InvalidStateTransition
        );

        let signer = ctx.accounts.signer.key();
        require!(
            signer == escrow.borrower || signer == escrow.lender,
            EscrowError::Unauthorized
        );

        escrow.state = EscrowState::Disputed;

        emit!(DisputeOpenedEvent {
            booking_id,
            reporter: signer,
            reason,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Resolve dispute: Authorized arbiter executes fair distribution of held funds.
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        booking_id: String,
        lender_award_lamports: u64,
        borrower_award_lamports: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.booking_id == booking_id, EscrowError::BookingMismatch);
        require!(escrow.state == EscrowState::Disputed, EscrowError::InvalidStateTransition);
        require!(ctx.accounts.arbiter.key() == escrow.arbiter, EscrowError::Unauthorized);

        let total_awarded = lender_award_lamports
            .checked_add(borrower_award_lamports)
            .ok_or(EscrowError::MathOverflow)?;

        let escrow_balance = escrow
            .rental_amount_lamports
            .checked_add(escrow.deposit_amount_lamports)
            .ok_or(EscrowError::MathOverflow)?;

        require!(total_awarded <= escrow_balance, EscrowError::ExcessiveAward);

        if lender_award_lamports > 0 {
            **escrow.to_account_info().try_borrow_mut_lamports()? = escrow
                .to_account_info()
                .lamports()
                .checked_sub(lender_award_lamports)
                .ok_or(EscrowError::MathOverflow)?;

            **ctx.accounts.lender.try_borrow_mut_lamports()? = ctx
                .accounts
                .lender
                .lamports()
                .checked_add(lender_award_lamports)
                .ok_or(EscrowError::MathOverflow)?;
        }

        if borrower_award_lamports > 0 {
            **escrow.to_account_info().try_borrow_mut_lamports()? = escrow
                .to_account_info()
                .lamports()
                .checked_sub(borrower_award_lamports)
                .ok_or(EscrowError::MathOverflow)?;

            **ctx.accounts.borrower.try_borrow_mut_lamports()? = ctx
                .accounts
                .borrower
                .lamports()
                .checked_add(borrower_award_lamports)
                .ok_or(EscrowError::MathOverflow)?;
        }

        escrow.state = EscrowState::Completed;

        emit!(DisputeResolvedEvent {
            booking_id,
            lender_award_lamports,
            borrower_award_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowState {
    Funded,
    HandedOver,
    Completed,
    Cancelled,
    Disputed,
}

#[account]
pub struct EscrowAccount {
    pub booking_id: String,
    pub borrower: Pubkey,
    pub lender: Pubkey,
    pub arbiter: Pubkey,
    pub rental_amount_lamports: u64,
    pub deposit_amount_lamports: u64,
    pub state: EscrowState,
    pub bump: u8,
    pub created_at: i64,
}

impl EscrowAccount {
    pub const LEN: usize = 8 + // discriminator
        4 + 64 + // booking_id (max 64 chars)
        32 + // borrower
        32 + // lender
        32 + // arbiter
        8 + // rental_amount_lamports
        8 + // deposit_amount_lamports
        1 + // state enum
        1 + // bump
        8; // created_at
}

#[derive(Accounts)]
#[instruction(booking_id: String)]
pub struct CreateEscrow<'info> {
    #[account(
        init,
        payer = borrower,
        space = EscrowAccount::LEN,
        seeds = [b"escrow", booking_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub borrower: Signer<'info>,

    /// CHECK: Validated against booking lender in metadata
    pub lender: AccountInfo<'info>,

    /// CHECK: Arbitrator/Reviewer authority for fair dispute resolution
    pub arbiter: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(booking_id: String)]
pub struct ConfirmHandover<'info> {
    #[account(
        mut,
        seeds = [b"escrow", booking_id.as_bytes()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(booking_id: String)]
pub struct CompleteReturn<'info> {
    #[account(
        mut,
        seeds = [b"escrow", booking_id.as_bytes()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub signer: Signer<'info>,

    /// CHECK: Verified against escrow.lender
    #[account(mut, address = escrow_account.lender)]
    pub lender: AccountInfo<'info>,

    /// CHECK: Verified against escrow.borrower
    #[account(mut, address = escrow_account.borrower)]
    pub borrower: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(booking_id: String)]
pub struct CancelBooking<'info> {
    #[account(
        mut,
        seeds = [b"escrow", booking_id.as_bytes()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub signer: Signer<'info>,

    /// CHECK: Verified against escrow.borrower
    #[account(mut, address = escrow_account.borrower)]
    pub borrower: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(booking_id: String)]
pub struct RaiseDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", booking_id.as_bytes()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(booking_id: String)]
pub struct ResolveDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", booking_id.as_bytes()],
        bump = escrow_account.bump,
    )]
    pub escrow_account: Account<'info, EscrowAccount>,

    pub arbiter: Signer<'info>,

    /// CHECK: Verified against escrow.lender
    #[account(mut, address = escrow_account.lender)]
    pub lender: AccountInfo<'info>,

    /// CHECK: Verified against escrow.borrower
    #[account(mut, address = escrow_account.borrower)]
    pub borrower: AccountInfo<'info>,
}

#[event]
pub struct EscrowCreatedEvent {
    pub booking_id: String,
    pub borrower: Pubkey,
    pub lender: Pubkey,
    pub rental_amount_lamports: u64,
    pub deposit_amount_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct HandoverConfirmedEvent {
    pub booking_id: String,
    pub borrower: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct EscrowCompletedEvent {
    pub booking_id: String,
    pub rental_payout: u64,
    pub deposit_refund: u64,
    pub timestamp: i64,
}

#[event]
pub struct EscrowRefundedEvent {
    pub booking_id: String,
    pub refund_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct DisputeOpenedEvent {
    pub booking_id: String,
    pub reporter: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct DisputeResolvedEvent {
    pub booking_id: String,
    pub lender_award_lamports: u64,
    pub borrower_award_lamports: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum EscrowError {
    #[msg("Booking ID exceeds maximum length of 64 characters")]
    BookingIdTooLong,
    #[msg("Rental amount must be greater than zero")]
    InvalidRentalAmount,
    #[msg("Arithmetic overflow detected")]
    MathOverflow,
    #[msg("Booking ID does not match escrow account")]
    BookingMismatch,
    #[msg("Action is not permitted in current escrow state")]
    InvalidStateTransition,
    #[msg("Signer is not authorized to execute this instruction")]
    Unauthorized,
    #[msg("Total awarded lamports exceeds escrow balance")]
    ExcessiveAward,
}
