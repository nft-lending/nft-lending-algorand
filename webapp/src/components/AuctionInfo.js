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
                const appAddr = await algosdk.getApplicationAddress(props.auctionID)
                setAppAccountInfo(await props.algodClient.accountInformation(appAddr).do())
            } catch (_) { setApp(null) }
        }) ()
    }, [props.algodClient, props.auctionID, props.refresh])

    function findParam(pname) {
        return app.params['global-state'].find(p => atob(p.key) === pname).value
    }

    function isDeposited() {
        const found = appAccountInfo.assets.find(asset => asset['asset-id'] === findParam("nft_id").uint)
        if (!found) return false
        return (found.amount > 0)
    }

    /*  Param names:
        min_bid_dec_f
        nft_id
        auction_end
        winning_lender
        loan_amount
        repay_amount
        repay_deadline
    */

    if (!app || !appAccountInfo) return(<>Enter a valid Auction ID!</>)
    try {
console.log("Info: ")
console.log(app)
console.log(appAccountInfo)
try {console.log(algosdk.encodeAddress(findParam("borrower",app).bytes))}
catch (e) { console.log(e)}
/*
                        {appAccountInfo.assets.find(asset => asset['asset-key'] === findParam("nft_id",app).uint).value > 0?
"Deposited":"Not deposited"}


                <tr>
                    <td>Algo funding</td>
                    <td>{appAccountInfo.amount / 1000000.0}</td>
                </tr>

*/
    return (<>
        <Table striped bordered hover>
            <tbody>
                <tr>
                    <td>NFT ID</td>
                    <td>{findParam("nft_id",app).uint} 
                        {isDeposited()?" Deposited":" Not deposited"}
                    </td>
                </tr>
                <tr>
                    <td>Algo funding</td>
                    <td>{appAccountInfo.amount / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Loan amount</td>
                    <td>{findParam("loan_amount").uint / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Repay amount</td>
                    <td>{findParam("repay_amount").uint / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Min repay decrease factor</td>
                    <td>{findParam("min_bid_dec_f").uint / 10000.0}</td>
                </tr>
                <tr>
                    <td>Auction End</td>
                    <td>{new Date(findParam("auction_end").uint).toString()}</td>
                </tr>
                <tr>
                    <td>Repayment Deadline</td>
                    <td>{new Date(findParam("repay_deadline").uint).toString()}</td>
                </tr>
                <tr>
                    <td>Borrower</td>
                    <td>{app.params.creator}</td>
                </tr>
                <tr>
                    <td>Winning Lender</td>
                    <td>{algosdk.encodeAddress(findParam("winning_lender").bytes)}</td>
                </tr>
            </tbody>
        </Table>
    </>)
    } catch(_) { return(<>Contract with given ID is not a valid Auction</>) }
}

export default AuctionInfo;