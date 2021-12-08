const TealCode = `#pragma version 5
txn ApplicationID
int 0
==
bnz main_l24
txn OnCompletion
int NoOp
==
bnz main_l13
txn OnCompletion
int DeleteApplication
==
bnz main_l6
txn OnCompletion
int OptIn
==
txn OnCompletion
int CloseOut
==
||
txn OnCompletion
int UpdateApplication
==
||
bnz main_l5
err
main_l5:
int 0
return
main_l6:
txna ApplicationArgs 0
byte "cancel"
==
bnz main_l12
txna ApplicationArgs 0
byte "repay"
==
bnz main_l9
err
main_l9:
txn NumAppArgs
int 1
==
txn Sender
byte "borrower"
app_global_get
==
&&
byte "winning_lender"
app_global_get
global ZeroAddress
!=
&&
global LatestTimestamp
byte "repay_deadline"
app_global_get
<=
&&
global CurrentApplicationAddress
balance
byte "repay_amount"
app_global_get
>=
&&
assert
global CurrentApplicationAddress
balance
byte "repay_amount"
app_global_get
global MinTxnFee
+
>
bnz main_l11
main_l10:
byte "nft_id"
app_global_get
byte "borrower"
app_global_get
callsub sub0
byte "winning_lender"
app_global_get
callsub sub1
int 1
return
main_l11:
itxn_begin
int pay
itxn_field TypeEnum
global CurrentApplicationAddress
balance
byte "repay_amount"
app_global_get
-
global MinTxnFee
-
itxn_field Amount
byte "borrower"
app_global_get
itxn_field Receiver
itxn_submit
b main_l10
main_l12:
txn NumAppArgs
int 1
==
txn Sender
byte "borrower"
app_global_get
==
&&
byte "winning_lender"
app_global_get
global ZeroAddress
==
&&
assert
byte "nft_id"
app_global_get
byte "borrower"
app_global_get
callsub sub0
byte "borrower"
app_global_get
callsub sub1
int 1
return
main_l13:
txna ApplicationArgs 0
byte "start_auction"
==
bnz main_l23
txna ApplicationArgs 0
byte "bid"
==
bnz main_l20
txna ApplicationArgs 0
byte "borrow"
==
bnz main_l19
txna ApplicationArgs 0
byte "liquidate"
==
bnz main_l18
err
main_l18:
txn NumAppArgs
int 1
==
txn Sender
byte "winning_lender"
app_global_get
==
&&
global LatestTimestamp
byte "repay_deadline"
app_global_get
>
&&
assert
byte "nft_id"
app_global_get
byte "winning_lender"
app_global_get
callsub sub0
byte "borrower"
app_global_get
callsub sub1
byte "winning_lender"
global ZeroAddress
app_global_put
int 1
return
main_l19:
txn NumAppArgs
int 1
==
global LatestTimestamp
byte "auction_end"
app_global_get
>
&&
assert
itxn_begin
int pay
itxn_field TypeEnum
byte "loan_amount"
app_global_get
global MinTxnFee
-
itxn_field Amount
byte "borrower"
app_global_get
itxn_field Receiver
itxn_submit
int 1
return
main_l20:
global CurrentApplicationAddress
byte "nft_id"
app_global_get
asset_holding_get AssetBalance
store 0
store 1
txn NumAppArgs
int 2
==
load 0
&&
load 1
int 0
>
&&
global LatestTimestamp
byte "auction_end"
app_global_get
<
&&
txna ApplicationArgs 1
btoi
byte "loan_amount"
app_global_get
>
&&
txna ApplicationArgs 1
btoi
byte "repay_amount"
app_global_get
byte "repay_amount"
app_global_get
byte "loan_amount"
app_global_get
-
txna ApplicationArgs 5
btoi
*
int 10000
/
-
<
&&
txn GroupIndex
int 1
-
gtxns TypeEnum
int pay
==
&&
txn GroupIndex
int 1
-
gtxns Sender
txn Sender
==
&&
txn GroupIndex
int 1
-
gtxns Receiver
global CurrentApplicationAddress
==
&&
txn GroupIndex
int 1
-
gtxns Amount
global MinTxnFee
>=
&&
txn GroupIndex
int 1
-
gtxns Amount
byte "loan_amount"
app_global_get
>=
&&
assert
byte "winning_lender"
app_global_get
global ZeroAddress
!=
bnz main_l22
main_l21:
byte "repay_amount"
txna ApplicationArgs 1
btoi
app_global_put
byte "winning_lender"
txn GroupIndex
int 1
-
gtxns Sender
app_global_put
int 1
return
main_l22:
itxn_begin
int pay
itxn_field TypeEnum
byte "loan_amount"
app_global_get
global MinTxnFee
-
itxn_field Amount
byte "winning_lender"
app_global_get
itxn_field Receiver
itxn_submit
b main_l21
main_l23:
txn NumAppArgs
int 1
==
global LatestTimestamp
byte "auction_end"
app_global_get
<
&&
assert
itxn_begin
int axfer
itxn_field TypeEnum
byte "nft_id"
app_global_get
itxn_field XferAsset
global CurrentApplicationAddress
itxn_field AssetReceiver
itxn_submit
int 1
return
main_l24:
txn NumAppArgs
int 6
==
global LatestTimestamp
txna ApplicationArgs 1
btoi
<
&&
txna ApplicationArgs 1
btoi
txna ApplicationArgs 2
btoi
<
&&
txna ApplicationArgs 3
btoi
txna ApplicationArgs 4
btoi
<
&&
txna ApplicationArgs 5
btoi
int 0
>=
&&
txna ApplicationArgs 5
btoi
int 10000
<
&&
assert
byte "borrower"
txn Sender
app_global_put
byte "nft_id"
txna ApplicationArgs 0
btoi
app_global_put
byte "auction_end"
txna ApplicationArgs 1
btoi
app_global_put
byte "repay_deadline"
txna ApplicationArgs 2
btoi
app_global_put
byte "loan_amount"
txna ApplicationArgs 3
btoi
app_global_put
byte "repay_amount"
txna ApplicationArgs 4
btoi
app_global_put
byte "min_bid_dec_f"
txna ApplicationArgs 5
btoi
app_global_put
byte "winning_lender"
global ZeroAddress
app_global_put
int 1
return
sub0: // closeNFTTo
store 3
store 2
global CurrentApplicationAddress
load 2
asset_holding_get AssetBalance
store 4
store 5
load 4
bz sub0_l2
itxn_begin
int axfer
itxn_field TypeEnum
load 2
itxn_field XferAsset
load 3
itxn_field AssetCloseTo
itxn_submit
sub0_l2:
retsub
sub1: // closeAccountTo
store 6
global CurrentApplicationAddress
balance
int 0
!=
bz sub1_l2
itxn_begin
int pay
itxn_field TypeEnum
load 6
itxn_field CloseRemainderTo
itxn_submit
sub1_l2:
retsub`;
export default TealCode;
