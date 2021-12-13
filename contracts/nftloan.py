from typing import Final
from pyteal import *

DENOMINATOR: Final = 10000

def approval_program():
    borrower = Global.creator_address()
    nft_id_key = Bytes("nft_id")
    auction_end_time_key = Bytes("auction_end") # BTW, auction starts when contract is deployed
    repay_deadline_key = Bytes("repay_deadline")
    loan_amount_key = Bytes("loan_amount")
    min_bid_decrement_factor_key = Bytes("min_bid_dec_f")
    repay_amount_key = Bytes("repay_amount") # initially this is the worst repay amount borrower is willing to accept
    winning_lender_key = Bytes("winning_lender") # after auction end this is the lender

    # from Algorand auction demo
    @Subroutine(TealType.none)
    def closeNFTTo(assetID: Expr, account: Expr) -> Expr:
        asset_holding = AssetHolding.balance(
            Global.current_application_address(), assetID
        )
        return Seq(
            asset_holding,
            If(asset_holding.hasValue()).Then(
                Seq(
                    InnerTxnBuilder.Begin(),
                    InnerTxnBuilder.SetFields(
                        {
                            TxnField.type_enum: TxnType.AssetTransfer,
                            TxnField.xfer_asset: assetID,
                            TxnField.asset_close_to: account,
                        }
                    ),
                    InnerTxnBuilder.Submit(),
                )
            ),
        )

    # from Algorand auction demo
    @Subroutine(TealType.none)
    def closeAccountTo(account: Expr) -> Expr:
        return If(Balance(Global.current_application_address()) != Int(0)).Then(
            Seq(
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.Payment,
                        TxnField.close_remainder_to: account,
                    }
                ),
                InnerTxnBuilder.Submit(),
            )
        )

    on_create_nft_id = Btoi(Txn.application_args[0])
    on_create_auction_end_time = Btoi(Txn.application_args[1])
    on_create_repay_deadline = Btoi(Txn.application_args[2])
    on_create_loan_amount = Btoi(Txn.application_args[3])
    on_create_max_repay = Btoi(Txn.application_args[4])
    on_create_min_bid_decrement_factor = Btoi(Txn.application_args[5])
    on_create = Seq(
        Assert(
            And(
                Txn.application_args.length() == Int(6),
                Global.latest_timestamp() < on_create_auction_end_time, # cannot end before creation
                on_create_auction_end_time < on_create_repay_deadline, # cannot repay before auction end
                on_create_loan_amount < on_create_max_repay, # repaying more than borrowing
                on_create_min_bid_decrement_factor >= Int(0), # 0 would mean "buy now" instead of auction
                on_create_min_bid_decrement_factor < Int(DENOMINATOR), # prevent increasing bids for repayment amount
            )
        ),
        # borrower initiates the auction, so he is Global.creator_address()
        App.globalPut(nft_id_key, on_create_nft_id),
        App.globalPut(auction_end_time_key, on_create_auction_end_time),
        App.globalPut(repay_deadline_key, on_create_repay_deadline),  
        App.globalPut(loan_amount_key, on_create_loan_amount),
        App.globalPut(repay_amount_key, on_create_max_repay),
        App.globalPut(min_bid_decrement_factor_key, on_create_min_bid_decrement_factor),
        App.globalPut(winning_lender_key, Global.zero_address()),
        Approve(),
    )

    # on_start transaction should be sandwiched between 2 other transactions in an atomic group
    # 1. Fund the contract with minumum amount + NFT opt-in allowance + 3x min tx fee
    # 2. This transaction (on_start)
    # 3. Transfer in the NFT
    on_start = Seq(
        Assert(
            And(
                Txn.sender() == borrower,
                Txn.application_args.length() == Int(1),
                Global.latest_timestamp() < App.globalGet(auction_end_time_key), # must start before auction end
            )
        ),
        # opt into NFT asset -- because you can't opt in if you're already opted in, this is what
        # we'll use to make sure the contract has been set up
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields(
            {
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: App.globalGet(nft_id_key),
                TxnField.asset_receiver: Global.current_application_address(),
                # no need: TxnField.asset_amount = Int(0)
            }
        ),
        InnerTxnBuilder.Submit(),
        Approve(),
    )

    # on_bid transaction should be preceded in an atomic group by a payment transaction
    # which funds the loan to the borrower, but at least the min transaction fee
    on_bid_txn_index = Txn.group_index() - Int(1)
    on_bid_nft_holding = AssetHolding.balance(
        Global.current_application_address(), App.globalGet(nft_id_key)
    )
    on_bid_repay_amount = Btoi(Txn.application_args[1])
    on_bid_winning_bid_amount = App.globalGet(repay_amount_key)
    on_bid_loan_amount = App.globalGet(loan_amount_key)
    on_bid_min_bid_decrement_factor = App.globalGet(min_bid_decrement_factor_key)
    on_bid = Seq(
        on_bid_nft_holding, # why? .hasValue() and .value() need it
        Assert(
            And(
                Txn.application_args.length() == Int(2),
                # the auction has been initiated by depositing the NFT
                on_bid_nft_holding.hasValue(),
                on_bid_nft_holding.value() > Int(0),
                # the auction has not ended
                Global.latest_timestamp() < App.globalGet(auction_end_time_key),
                # the new bid is within limits
                on_bid_repay_amount > on_bid_loan_amount,
                on_bid_repay_amount < on_bid_loan_amount + (on_bid_winning_bid_amount - on_bid_loan_amount) * on_bid_min_bid_decrement_factor / Int(DENOMINATOR),
                # the actual bid payment is before the app call
                Gtxn[on_bid_txn_index].type_enum() == TxnType.Payment,
                Gtxn[on_bid_txn_index].sender() == Txn.sender(),
                Gtxn[on_bid_txn_index].receiver() == Global.current_application_address(),
                Gtxn[on_bid_txn_index].amount() >= Global.min_txn_fee(),
                Gtxn[on_bid_txn_index].amount() >= on_bid_loan_amount, # will subtract the fee upon eventual refund
            )
        ),
        If(App.globalGet(winning_lender_key) != Global.zero_address()).Then( # Not the first bid
            Seq( # Repay the loser - as the winner already funded
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.Payment,
                        TxnField.amount: App.globalGet(loan_amount_key) - Global.min_txn_fee(),
                        TxnField.receiver: App.globalGet(winning_lender_key),
                    }
                ),
                InnerTxnBuilder.Submit(),
            )
        ),
        App.globalPut(repay_amount_key, on_bid_repay_amount),
        App.globalPut(winning_lender_key, Gtxn[on_bid_txn_index].sender()),
        Approve(),
    )

    on_borrow = Seq(
        Assert(
            And(
                Txn.sender() == borrower,
                Txn.application_args.length() == Int(1),
                Global.latest_timestamp() > App.globalGet(auction_end_time_key), # Auction has ended
            )
        ),
        # Transfer loan funds to borrower
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields(
            {
                TxnField.type_enum: TxnType.Payment,
                TxnField.amount: App.globalGet(loan_amount_key) - Global.min_txn_fee(),
                TxnField.receiver: borrower,
            }
        ),
        InnerTxnBuilder.Submit(),
        Approve(),
    )

    on_liquidate = Seq(
        Assert(
            And(
                Txn.sender() == App.globalGet(winning_lender_key), # Covers case where there was no bider at all
                Txn.application_args.length() == Int(1),
                Global.latest_timestamp() > App.globalGet(repay_deadline_key), # Repayment deadline has passed
                # If repayed the contract would not exist any longer
            )
        ),
        # The NFT goes to the liquidator = lender
        closeNFTTo(App.globalGet(nft_id_key), App.globalGet(winning_lender_key)),
        # remove winning lender so auction contract can be deleted by "cancel" operation
        App.globalPut(winning_lender_key, Global.zero_address()),
        # The funds, potentially unclaimed by borrower go to the borrower
        closeAccountTo(borrower),
        Approve(),
    )

    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("start_auction"), on_start],
        [on_call_method == Bytes("bid"), on_bid],
        [on_call_method == Bytes("borrow"), on_borrow],
        [on_call_method == Bytes("liquidate"), on_liquidate],
    )

    # on_repay transaction should be preceded by a payment, not necessary in the same transaction group
    on_repay = Seq(
        Assert(
            And(
                Txn.sender() == borrower, # can happen before borrowing, so only borrower should be allowed this
                Txn.application_args.length() == Int(1),
                App.globalGet(winning_lender_key) != Global.zero_address(),
                Global.latest_timestamp() > App.globalGet(auction_end_time_key), # Auction has ended
                Global.latest_timestamp() <= App.globalGet(repay_deadline_key), # Repayment deadline has not passed
                # If liquidated the contract would not exist any longer
                Balance(Global.current_application_address()) >= App.globalGet(repay_amount_key), # enough to repay lender
            )
        ),
        If(Balance(Global.current_application_address()) > App.globalGet(repay_amount_key) + Global.min_txn_fee()).Then( # Contract balance shows overpaid
            Seq( # Redfund borrower the overpayment
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields(
                    {
                        TxnField.type_enum: TxnType.Payment,
                        TxnField.amount: Balance(Global.current_application_address()) - App.globalGet(repay_amount_key) - Global.min_txn_fee(),
                        TxnField.receiver: borrower,
                    }
                ),
                InnerTxnBuilder.Submit(),
            )
        ),
        # The NFT goes to the borrower
        closeNFTTo(App.globalGet(nft_id_key), borrower),
        # The funds go to the lender
        closeAccountTo(App.globalGet(winning_lender_key)),
        Approve(),
    )

    # Auction can be canceled at any time as long as there is no bider
    on_cancel = Seq(
        Assert(
            And(
                Txn.sender() == borrower,
                Txn.application_args.length() == Int(1),
                App.globalGet(winning_lender_key) == Global.zero_address(), # noone bid
            )
        ),
        # The NFT and the funds go to the borrower
        closeNFTTo(App.globalGet(nft_id_key), borrower),
        closeAccountTo(borrower),
        Approve(),
    )

    on_delete_method = Txn.application_args[0]
    on_delete = Cond(
        [on_delete_method == Bytes("cancel"), on_cancel],
        [on_delete_method == Bytes("repay"), on_repay],
    )

    program = Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, on_call],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete],
        [
            Or(
                Txn.on_completion() == OnComplete.OptIn,
                Txn.on_completion() == OnComplete.CloseOut,
                Txn.on_completion() == OnComplete.UpdateApplication,
            ),
            Reject(),
        ],
    )

    return program


def clear_state_program():
    return Approve()


if __name__ == "__main__":
    with open("../build/nftloan_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=5)
        f.write(compiled)

    with open("../build/nftloan_clear_state.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=5)
        f.write(compiled)
