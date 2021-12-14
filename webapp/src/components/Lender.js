import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'
import algosdk from 'algosdk'
import OptInAsset from './OptInAsset'
import AuctionInfo from './AuctionInfo'
import signSendAwait from '../util/signSendAwait'
import zeroAddress from '../util/zeroAddress'

function Lender(props) {
    const [appID, setAppID] = React.useState(0)
    const [repaymentAmount, setRepymentAmount] = React.useState(0.0)
    const [refreshAuctionInfo, setRefreshAuctionInfo] = React.useState(0)
    const doRefreshAuctionInfo = () => { setRefreshAuctionInfo(Math.random()) }

    const onBid = async () => {
        const app = await props.algodClient.getApplicationByID(appID).do().catch((_) => { return undefined })
        if (app === undefined) { window.alert("Auction does not exist."); return }
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        const auctionEnd = app.params['global-state'].find(p => atob(p.key) === "auction_end").value.uint * 1000
        const loanAmount = app.params['global-state'].find(p => atob(p.key) === "loan_amount").value.uint
        const currentRepayAmount = app.params['global-state'].find(p => atob(p.key) === "repay_amount").value.uint
        const minBidDec = app.params['global-state'].find(p => atob(p.key) === "min_bid_dec_f").value.uint
        const losingLender = algosdk.encodeAddress(new Buffer(app.params['global-state'].find(p => atob(p.key) === "winning_lender").value.bytes, 'base64'))

        if (Date.now() > auctionEnd) {
            window.alert("The auction has ended.")
            return
        }

        const r = Math.floor(repaymentAmount * 1000000)
        const maxR = loanAmount + minBidDec * (currentRepayAmount-loanAmount) / 10000
        if (r < loanAmount ||
            r > maxR) {
            window.alert(
                "Repayment amount must be between " + 
                loanAmount / 1000000.0 + " and " +
                maxR / 1000000.0 + ".")
            return
        }

        const params = await props.algodClient.getTransactionParams().do()
        const appAddr = algosdk.getApplicationAddress(appID)

        // Fund contract with 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 3000 + loanAmount, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("bid")))
        appArgs.push(algosdk.encodeUint64(r))
        const adrList =  (losingLender === zeroAddress)?undefined:[losingLender]
        const bidTx = algosdk.makeApplicationNoOpTxn(props.account.address, params, appID, appArgs, adrList, undefined, [nftID])

        await signSendAwait([fundTx, bidTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    const onLiquidate = async () => {
        const app = await props.algodClient.getApplicationByID(appID).do().catch((_) => { return undefined })
        if (app === undefined) { window.alert("Auction does not exist."); return }
        const repaymentDeadline = app.params['global-state'].find(p => atob(p.key) === "repay_deadline").value.uint * 1000
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        const borrower = app.params.creator

        if (Date.now() <= repaymentDeadline) {
            window.alert("Cannot liquidate before the repayment deadline.")
            return
        }

        const params = await props.algodClient.getTransactionParams().do()
        const appAddr = algosdk.getApplicationAddress(appID)

        // Fund contract with 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 3000, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("liquidate")))
        const liquidateTx = algosdk.makeApplicationNoOpTxn(props.account.address, params, appID, appArgs, [borrower], undefined, [nftID])

        await signSendAwait([fundTx, liquidateTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    return (<>
        <Container fluid="md">
            <Row>
                <Col>
                    <OptInAsset algodClient={props.algodClient} account={props.account} wallet={props.wallet} refreshAccountInfo={props.refreshAccountInfo} />
                </Col>
                <Col>
                    <Card border="primary" style={{ width: '48rem' }}>
                        <Card.Header>Auction: {appID}</Card.Header>
                        <Card.Body>
                            <AuctionInfo auctionID={appID} algodClient={props.algodClient} refresh={refreshAuctionInfo} />

                            <Form>
                            <Form.Group className="mb-3">
                                    <Form.Label>Auction ID</Form.Label>
                                    <Form.Control type="number" onChange={e => setAppID(parseInt(e.target.value))} placeholder="49055308" />
                                </Form.Group>
                                <br/><br/>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reayment amount</Form.Label>
                                    <Form.Control type="number" onChange={e => setRepymentAmount(parseFloat(e.target.value))} placeholder="120.0" />
                                </Form.Group>

                                <Button variant="primary" onClick={onBid}>
                                    Bid
                                </Button>
                                <br/><br/>
                                <Button variant="primary" onClick={onLiquidate}>
                                    Liquidate
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </>);
}

export default Lender;