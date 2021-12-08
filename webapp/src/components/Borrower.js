import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Form, Button, Card } from 'react-bootstrap'
import Balances from './Balances'
import algosdk from 'algosdk'
import { waitForConfirmation } from '../imported/waitForConfirmation'
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

        const currentBlock = (await props.algodClient.status().do())['last-round']

        const appArgs = [];
        appArgs.push(algosdk.encodeUint64(nftId))
        appArgs.push(algosdk.encodeUint64(currentBlock+auctionDuration))
        appArgs.push(algosdk.encodeUint64(currentBlock+repayDuration))
        appArgs.push(algosdk.encodeUint64(Math.floor(loanAmount * 1000000)))
        appArgs.push(algosdk.encodeUint64(Math.floor(maxRepayAmount * 1000000)))
        appArgs.push(algosdk.encodeUint64(Math.floor(decrFactor*DENOMINATOR)))

        const auctionContractCreateTxn = algosdk.makeApplicationCreateTxn(
            props.account.address,
            params,
            algosdk.OnApplicationComplete.NoOpOC.real,
            approvalProgram,
            clearProgram,
            0,
            0,
            6, // or appArgs.length
            0,
            appArgs
        )
        const txId = auctionContractCreateTxn.txID().toString();
        const signedTxn = await props.wallet.signTransaction(auctionContractCreateTxn.toByte())
console.log("Signed")
        const txnid = 0 //const txnid = await props.algodClient.sendRawTransaction(signedTxn.blob).do()
console.log("Sent")
console.log(props)
console.log(algosdk)
        try {
            const confirmedTxn = await waitForConfirmation(props.algodClient, txnid, 3)
            console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
console.log("confirmedTxn")
console.log(confirmedTxn)
            setApplicationIndex(confirmedTxn.applicationIndex)
        } catch (e) {console.log(e); window.alert("Not confirmed in 3 rounds.") }
    }

    return (<>
        <Balances algodClient={props.algodClient} account={props.account} accountInfo={props.accountInfo} />

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
                        <Form.Label>Auction Duration (blocks)</Form.Label>
                        <Form.Control type="number" onChange={e => setAuctionDuration(parseInt(e.target.value))} placeholder="10" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Repaymen Duration (blocks)</Form.Label>
                        <Form.Control type="number" onChange={e => setRepayDuration(parseInt(e.target.value))} placeholder="50" />
                    </Form.Group>

                    <Button variant="primary" onClick={onStartAuction}>
                        Start auction
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    </>);
}

export default Borrower;