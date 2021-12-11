import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import {Table} from 'react-bootstrap'

function AuctionInfo(props) {
    const [app, setApp] = React.useState();

    React.useEffect(() => {
        (async () => {
            try {
                setApp(await props.algodClient.getApplicationByID(props.auctionID).do())
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

    if (!app) return(<>Enter a valid Auction ID!</>)
    try {
    return (<>
        <Table striped bordered hover>
            <tbody>
                <tr>
                    <td>NFT ID</td>
                    <td>{findParam("nft_id",app).uint}</td>
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
                    <td>Block {findParam("auction_end",app).uint}</td>
                </tr>
                <tr>
                    <td>Repayment Deadline</td>
                    <td>Block {findParam("repay_deadline",app).uint}</td>
                </tr>
                <tr>
                    <td>Borrower</td>
                    <td>{findParam("borrower",app).bytes}</td>
                </tr>
                <tr>
                    <td>Winning Lender</td>
                    <td>{findParam("winning_lender",app).bytestd}</td>
                </tr>
            </tbody>
        </Table>
    </>)
    } catch(_) { return(<>Contract with given ID is not a valid Auction</>) }
}

export default AuctionInfo;