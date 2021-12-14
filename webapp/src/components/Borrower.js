import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'
import algosdk from 'algosdk'
import signSendAwait from '../util/signSendAwait'
import AuctionInfo from './AuctionInfo'
import CreateAuction from './CreateAuction'
import zeroAddress from '../util/zeroAddress'

function Borrower(props) {
    const [appID, setAppID] = React.useState(0)
    const [refreshAuctionInfo, setRefreshAuctionInfo] = React.useState(0)
    const doRefreshAuctionInfo = () => { setRefreshAuctionInfo(Math.random()) }

    const onStartAuction = async () => {
        const app = await props.algodClient.getApplicationByID(appID).do().catch((_) => { return undefined })
        if (app === undefined) { window.alert("Auction does not exist."); return }
        const auctionEnd = app.params['global-state'].find(p => atob(p.key) === "auction_end").value.uint * 1000
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        const borrower = app.params.creator

        if (props.account.address !== borrower) {
            window.alert("Not your auction.")
            return
        }

        if (Date.now() > auctionEnd) {
            window.alert("Cannot start auction after its scheduled ending.")
            return
        }

        const params = await props.algodClient.getTransactionParams().do()
        const appAddr = algosdk.getApplicationAddress(appID)
        
        // Fund contract with 100k min balance + 100k NFT opt-in + 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 203000, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("start_auction")))
        const startTx = algosdk.makeApplicationNoOpTxn(props.account.address, params, appID, appArgs, undefined, undefined, [nftID])

        const nftDepositTx = algosdk.makeAssetTransferTxnWithSuggestedParams(
            props.account.address, appAddr, 
            undefined, undefined, 1, undefined, nftID, params)

            await signSendAwait([fundTx, startTx, nftDepositTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    const onCancelAuction = async () => {
        const app = await props.algodClient.getApplicationByID(appID).do().catch((_) => { return undefined })
        if (app === undefined) { window.alert("Auction does not exist."); return }
        const winningLender = algosdk.encodeAddress(new Buffer(app.params['global-state'].find(p => atob(p.key) === "winning_lender").value.bytes, 'base64'))
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        const borrower = app.params.creator

        if (props.account.address !== borrower) {
            window.alert("Not your auction.")
            return
        }

        if (winningLender !== zeroAddress) {
            window.alert("Cannot cancel auction with existing bidders.")
            return
        }

        if (winningLender !== zeroAddress) {
            window.alert("Cannot cancel auction with existing bidders.")
            return
        }

        const params = await props.algodClient.getTransactionParams().do()
        const appAddr = algosdk.getApplicationAddress(appID)

        // Fund contract with 100k to delete app + 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 103000, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("cancel")))
        const cancelTx = algosdk.makeApplicationDeleteTxn(props.account.address, params, appID, appArgs, undefined, undefined, [nftID])

        await signSendAwait([fundTx, cancelTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    const onBorrow = async () => {
        const app = await props.algodClient.getApplicationByID(appID).do().catch((_) => { return undefined })
        if (app === undefined) { window.alert("Auction does not exist."); return }
        const auctionEnd = app.params['global-state'].find(p => atob(p.key) === "auction_end").value.uint * 1000
        const winningLender = algosdk.encodeAddress(new Buffer(app.params['global-state'].find(p => atob(p.key) === "winning_lender").value.bytes, 'base64'))
        const borrower = app.params.creator
        
        if (props.account.address !== borrower) {
            window.alert("Not your auction.")
            return
        }

        if (Date.now() <= auctionEnd) {
            window.alert("Cannot borrow before the auction ends.")
            return
        }

        if (winningLender === zeroAddress) {
            window.alert("Cannot borrow - there is no lender.")
            return
        }

        const params = await props.algodClient.getTransactionParams().do()

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("borrow")))
        const borrowTx = algosdk.makeApplicationNoOpTxn(props.account.address, params, appID, appArgs)

        await signSendAwait([borrowTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    const onRepay = async () => {
        const app = await props.algodClient.getApplicationByID(appID).do().catch((_) => { return undefined })
        if (app === undefined) { window.alert("Auction does not exist."); return }
        const auctionEnd = app.params['global-state'].find(p => atob(p.key) === "auction_end").value.uint * 1000
        const repaymentDeadline = app.params['global-state'].find(p => atob(p.key) === "repay_deadline").value.uint * 1000
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        const repayAmount = app.params['global-state'].find(p => atob(p.key) === "repay_amount").value.uint
        const lender = algosdk.encodeAddress(new Buffer(app.params['global-state'].find(p => atob(p.key) === "winning_lender").value.bytes, 'base64'))
        const borrower = app.params.creator

        if (props.account.address !== borrower) {
            window.alert("Not your auction.")
            return
        }

        if (Date.now() <= auctionEnd) {
            window.alert("Cannot repay before the auction ends.")
            return
        }

        if (Date.now() > repaymentDeadline) {
            window.alert("Cannot repay after the repayment deadline.")
            return
        }

        if (lender === zeroAddress) {
            window.alert("Nothing to repay.")
            return
        }

        const params = await props.algodClient.getTransactionParams().do()
        const appAddr = await algosdk.getApplicationAddress(appID)

        // Fund contract with 100k to delete app + 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 103000 + repayAmount, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("repay")))
        const repayTx = algosdk.makeApplicationDeleteTxn(props.account.address, params, appID, appArgs, [lender], undefined, [nftID])

        await signSendAwait([fundTx, repayTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    return (<>
        <Container fluid="md">
            <Row>
                <Col>
                    <CreateAuction {...props} />
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

                                <Button variant="primary" onClick={onStartAuction}>
                                    Start auction
                                </Button>
                                <br/><br/>
                                <Button variant="primary" onClick={onBorrow}>
                                    Borrow
                                </Button>
                                <br/><br/>
                                <Button variant="primary" onClick={onRepay}>
                                    Repay Auction + Delete
                                </Button>
                                <br/><br/>
                                <Button variant="primary" onClick={onCancelAuction}>
                                    Cancel Auction + Delete
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </>);
}

export default Borrower;