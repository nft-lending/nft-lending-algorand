import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Form, Button, Card } from 'react-bootstrap'
import Balances from './Balances'
import algosdk from 'algosdk'
import signSendAwait from '../util/signSendAwait'
import * as nftloan_approval from '../teal/nftloan_approval.teal'
import * as nftloan_clear_state from '../teal/nftloan_clear_state.teal'

function Borrower(props) {
    const DENOMINATOR = 10000
    const [nftId, setNFTId] = React.useState(0)
    const [loanAmount, setLoanAmount] = React.useState(0.0)
    const [maxRepayAmount, setMaxRepayAmount] = React.useState(0.0)
    const [decrFactor, setdecrFactor] = React.useState(0.9)
    const [auctionDuration, setAuctionDuration] = React.useState(10)
    const [repayDuration, setRepayDuration] = React.useState(50)
    const [applicationIndex, setApplicationIndex] = React.useState(0)

    const compileProgram = async programSource => {
            const encoder = new TextEncoder();
            const programBytes = encoder.encode(programSource);
            const compileResponse = await props.algodClient.compile(programBytes).do();
            const compiledBytes = new Uint8Array(Buffer.from(compileResponse.result, "base64"));
            return compiledBytes;
    }

    const onStartAuction = async () => {
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
console.log(appArgs)
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
        const confirmedTxn = signSendAwait(txn, props.wallet, props.algodClient, props.refreshAccountInfo)
        if (confirmedTxn) setApplicationIndex(confirmedTxn.applicationIndex)
    }

    const onDeleteAuction = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        const appArgs = [];
        appArgs.push(algosdk.encodeObj("cancel"))
console.log(appArgs)
        // create unsigned transaction
        const txn = algosdk.makeApplicationDeleteTxn(props.account.address, params, 50005888, appArgs);

        signSendAwait(txn, props.wallet, props.algodClient, props.refreshAccountInfo)
    }

    const onOptIn = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        // create unsigned transaction
        const txn = algosdk.makeApplicationOptInTxn(props.account.address, params, 49982576);

        signSendAwait(txn, props.wallet, props.algodClient, props.refreshAccountInfo)
    }

    const onClearAuction = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        // create unsigned transaction 
        // TODO: ompare to makeApplicationCloseOutTxn 
        const txn = algosdk.makeApplicationClearStateTxn(props.account.address, params, 49982576);

        signSendAwait(txn, props.wallet, props.algodClient, props.refreshAccountInfo)
    }
    return (<>
        <Balances algodClient={props.algodClient} account={props.account} accountInfo={props.accountInfo} refreshAccountInfo={props.refreshAccountInfo} wallet={props.wallet} />

        <Card border="primary" style={{ width: '18rem' }}>
            <Card.Header>Auction: {applicationIndex}</Card.Header>
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
                        <Form.Label>Repaymen Duration (seconds)</Form.Label>
                        <Form.Control type="number" onChange={e => setRepayDuration(parseInt(e.target.value))} placeholder="50" />
                    </Form.Group>

                    <Button variant="primary" onClick={onStartAuction}>
                        Start auction
                    </Button>
                    <br/><br/>
                    <Button variant="primary" onClick={onOptIn}>
                        Opt In
                    </Button>
                    <br/><br/>
                    <Button variant="primary" onClick={onClearAuction}>
                        Clear
                    </Button>
                    <br/><br/>
                    <Button variant="primary" onClick={onDeleteAuction}>
                        Cancel Auction (Delete)
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    </>);
}

export default Borrower;