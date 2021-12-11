import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Form, Button, Card } from 'react-bootstrap'
import algosdk from 'algosdk'
import signSendAwait from '../util/signSendAwait'

function OptInAsset(props) {
    const [assetId, setAsseId] = React.useState(0)

    const onOptIn = async () => {
        const params = await props.algodClient.getTransactionParams().do()

        // create unsigned transaction
        let txn = algosdk.makeAssetTransferTxnWithSuggestedParams(props.account.address, props.account.address, undefined, undefined, 0, undefined, assetId, params)

        await signSendAwait([txn], props.wallet, props.algodClient, props.refreshAccountInfo)
    }

    return (<>
        <Card border="primary" style={{ width: '18rem' }}>
            <Card.Header>Asset Opt-in</Card.Header>
            <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Asset ID</Form.Label>
                        <Form.Control type="number" onChange={e => setAsseId(parseInt(e.target.value))} placeholder="49055308" />
                    </Form.Group>
                    <Button variant="primary" onClick={onOptIn}>
                        Opt In
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    </>);
}

export default OptInAsset;