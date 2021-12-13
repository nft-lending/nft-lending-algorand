import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import {Table} from 'react-bootstrap'
import algosdk from 'algosdk'

function AuctionInfo(props) {
    const [app, setApp] = React.useState();
    const [appAccountInfo, setAppAccountInfo] = React.useState();

    React.useEffect(() => {
        (async () => {
            try {
                setApp(await props.algodClient.getApplicationByID(props.auctionID).do())
                const appAddr = await props.algodClient.getApplicationAddress(props.auctionID).do()
                setAppAccountInfo(await props.algodClient.accountInformation(appAddr).do())
            } catch (_) { setApp(null) }
        }) ()
    }, [props.algodClient, props.auctionID, props.refresh])

    function findParam(pname, app) {
        return app.params['global-state'].find(p => atob(p.key) === pname).value
    }

    /*  Param names:
        min_bid_dec_f
        nft_id
        auction_end
        winning_lender
        borrower
        loan_amount
        repay_amount
        repay_deadline
    */

    if (!app || !appAccountInfo) return(<>Enter a valid Auction ID!</>)
    try {
console.log(app)
try {console.log(algosdk.encodeAddress(findParam("borrower",app).bytes))}
catch (e) { console.log(e)}
    return (<>
        <Table striped bordered hover>
            <tbody>
                <tr>
                    <td>NFT ID</td>
                    <td>{findParam("nft_id",app).uint}
                        {appAccountInfo.assets.find(asset => asset['asset-key'] === findParam("nft_id",app).uint).value > 0?
                            "Deposited":"Not deposited"}
                    </td>
                </tr>
                <tr>
                    <td>Algo funding</td>
                    <td>{appAccountInfo.amount / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Loan amount</td>
                    <td>{findParam("loan_amount",app).uint / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Repay amount</td>
                    <td>{findParam("repay_amount",app).uint / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Min repay decrease factor</td>
                    <td>{findParam("min_bid_dec_f",app).uint / 10000.0}</td>
                </tr>
                <tr>
                    <td>Auction End</td>
                    <td>{new Date(findParam("auction_end",app).uint).toString()}</td>
                </tr>
                <tr>
                    <td>Repayment Deadline</td>
                    <td>{new Date(findParam("repay_deadline",app).uint).toString()}</td>
                </tr>
                <tr>
                    <td>Borrower</td>
                    <td>{app.params.creator}</td>
                </tr>
                <tr>
                    <td>Winning Lender</td>
                    <td>{algosdk.encodeAddress(findParam("winning_lender",app).bytes)}</td>
                </tr>
            </tbody>
        </Table>
    </>)
    } catch(_) { return(<>Contract with given ID is not a valid Auction</>) }
}

export default AuctionInfo;