import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'
import algosdk from 'algosdk'
import signSendAwait from '../util/signSendAwait'
import * as nftloan_approval from '../teal/nftloan_approval.teal'
import * as nftloan_clear_state from '../teal/nftloan_clear_state.teal'
import AuctionInfo from './AuctionInfo'

function Borrower(props) {
    const DENOMINATOR = 10000
    const [nftId, setNFTId] = React.useState(0)
    const [loanAmount, setLoanAmount] = React.useState(0.0)
    const [maxRepayAmount, setMaxRepayAmount] = React.useState(0.0)
    const [decrFactor, setdecrFactor] = React.useState(0.9)
    const [auctionDuration, setAuctionDuration] = React.useState(10)
    const [repayDuration, setRepayDuration] = React.useState(50)
    const [appID, setAppID] = React.useState(0)
    const [refreshAuctionInfo, setRefreshAuctionInfo] = React.useState(0)
    const doRefreshAuctionInfo = () => { setRefreshAuctionInfo(Math.random()) }

    const compileProgram = async programSource => {
            const encoder = new TextEncoder();
            const programBytes = encoder.encode(programSource);
            const compileResponse = await props.algodClient.compile(programBytes).do();
            const compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
            return compiledBytes;
    }

    const onCreateAuction = async () => {
        const approvalProgram = await compileProgram(nftloan_approval.default)
        const clearProgram = await compileProgram(nftloan_clear_state.default)

        const params = await props.algodClient.getTransactionParams().do()

        //const currentBlock = (await props.algodClient.status().do())['last-round']
        const now = Date.now()
        const appArgs = [];
        appArgs.push(algosdk.encodeUint64(nftId))
        appArgs.push(algosdk.encodeUint64(now+auctionDuration*1000))
        appArgs.push(algosdk.encodeUint64(now+repayDuration*1000))
        appArgs.push(algosdk.encodeUint64(Math.floor(loanAmount * 1000000)))
        appArgs.push(algosdk.encodeUint64(Math.floor(maxRepayAmount * 1000000)))
        appArgs.push(algosdk.encodeUint64(Math.floor(decrFactor*DENOMINATOR)))

        const txn = algosdk.makeApplicationCreateTxn(
            props.account.address,
            params,
            algosdk.OnApplicationComplete.NoOpOC,
            approvalProgram,
            clearProgram,
            0,
            0,
            6,
            2,
            appArgs
        )
        //const txId = auctionContractCreateTxn.txID().toString();
        const confirmedTxn = await signSendAwait([txn], props.wallet, props.algodClient, props.refreshAccountInfo)
        //if (confirmedTxn) {
        //    console.log("Created aucton: " + confirmedTxn.appID)
        //    window.alert("Created auction: " + confirmedTxn.appID)
        //}
    }

    const onStartAuction = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        const appAddr = algosdk.getApplicationAddress(appID)
        const app = await props.algodClient.getApplicationByID(appID).do()
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        
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
        const params = await props.algodClient.getTransactionParams().do()
 
        const appAddr = algosdk.getApplicationAddress(appID)
        const app = await props.algodClient.getApplicationByID(appID).do()
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint

        // Fund contract with 100k NFT return + 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 103000, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("cancel")))
        const cancelTx = algosdk.makeApplicationDeleteTxn(props.account.address, params, appID, appArgs, undefined, undefined, [nftID])

        await signSendAwait([fundTx, cancelTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    const onRepayAuction = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        const appAddr = await props.algodClient.getApplicationAddress(appID).do()
        const app = await props.algodClient.getApplicationByID(appID).do()
        const nftID = app.params['global-state'].find(p => atob(p.key) === "nft_id").value.uint
        const repayAmount = app.params['global-state'].find(p => atob(p.key) === "repay_amount").value.uint

        // Fund contract with 100k NFT return + 3 * min tx fee
        const fundTx = algosdk.makePaymentTxnWithSuggestedParams(
            props.account.address, appAddr, 103000 + repayAmount, 
            undefined, undefined, params)

        const appArgs = [];
        appArgs.push(new Uint8Array(Buffer.from("repay")))
        const repayTx = algosdk.makeApplicationDeleteTxn(props.account.address, params, appID, appArgs, undefined, undefined, [nftID])

        await signSendAwait([fundTx, repayTx], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }

    /* Not needed - contract has no local state
    const onOptIn = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        // create unsigned transaction
        const txn = algosdk.makeApplicationOptInTxn(props.account.address, params, appID);

        await signSendAwait([txn], props.wallet, props.algodClient, props.refreshAccountInfo)
    }
    */

    const onClearAuction = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        // create unsigned transaction 
        // TODO: compare to makeApplicationCloseOutTxn 
        const txn = algosdk.makeApplicationClearStateTxn(props.account.address, params, appID);

        await signSendAwait([txn], props.wallet, props.algodClient, () => { props.refreshAccountInfo(); doRefreshAuctionInfo() })
    }
    return (<>
        <Container fluid="md">
            <Row>
                <Col>
                    <Card border="primary" style={{ width: '18rem' }}>
                        <Card.Header>Create Auction:</Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>NFT ID</Form.Label>
                                    <Form.Control type="number" onChange={e => setNFTId(parseInt(e.target.value))} placeholder="49055308" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Loan amount</Form.Label>
                                    <Form.Control type="number" onChange={e => setLoanAmount(parseFloat(e.target.value))} placeholder="100.0" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Max repay amount</Form.Label>
                                    <Form.Control type="number" onChange={e => setMaxRepayAmount(parseFloat(e.target.value))} placeholder="120.0" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Min repay decrease factor</Form.Label>
                                    <Form.Control type="number" onChange={e => setdecrFactor(parseFloat(e.target.value))} placeholder="0.9" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Auction Duration (seconds)</Form.Label>
                                    <Form.Control type="number" onChange={e => setAuctionDuration(parseInt(e.target.value))} placeholder="10" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Repayment Duration (seconds)</Form.Label>
                                    <Form.Control type="number" onChange={e => setRepayDuration(parseInt(e.target.value))} placeholder="50" />
                                </Form.Group>

                                <Button variant="primary" onClick={onCreateAuction}>
                                    Create auction
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card border="primary" style={{ width: '40rem' }}>
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
                                <Button variant="primary" onClick={onClearAuction}>
                                    Clear (not needed)
                                </Button>
                                <br/><br/>
                                <Button variant="primary" onClick={onRepayAuction}>
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