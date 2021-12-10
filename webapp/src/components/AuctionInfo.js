import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import {Table} from 'react-bootstrap'
import algosdk from 'algosdk'

function AuctionInfo(props) {
    const [app, setApp] = React.useState();

    const refreshApp = React.useEffect(() => {
        (async () => {
            setApp(await props.algodClient.getApplicationByID(props.auctionID).do())
        }) ()
    }, [props.auctionID])

    function findParam(pname, gsparams) {
        for (const p of gsparams) {
            if (atob(p.key) === pname) {
                return p.value
            }
        }
        return null;
    }

    /*
        min_bid_dec_f	ZZZ
        nft_id	ZZZ
        auction_end	ZZZ
        winning_lender	ZZZ
        borrower	ZZZ
        loan_amount	ZZZ
        repay_amount	ZZZ
        repay_deadline	ZZZ
    */

    if (!app) return(<></>)
    return (<>
        <Table striped bordered hover>
            <tbody>
                <tr>
                    <td>NFT ID</td>
                    <td>{findParam("nft_id",app.params['global-state']).uint}</td>
                </tr>
                <tr>
                    <td>Loan amount</td>
                    <td>{findParam("loan_amount",app.params['global-state']).uint / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Repay amount</td>
                    <td>{findParam("repay_amount",app.params['global-state']).uint / 1000000.0}</td>
                </tr>
                <tr>
                    <td>Min repay decrease factor</td>
                    <td>{findParam("min_bid_dec_f",app.params['global-state']).uint / 10000.0}</td>
                </tr>
                <tr>
                    <td>Auction End</td>
                    <td>{new Date().setTime(findParam("auction_end",app.params['global-state']).uint)}</td>
                </tr>
                <tr>
                    <td>Repayment Deadline</td>
                    <td>{new Date().setTime(findParam("repay_deadline",app.params['global-state']).uint)}</td>
                </tr>
                <tr>
                    <td>Borrower</td>
                    <td>{findParam("borrower",app.params['global-state']).bytes}</td>
                </tr>
                <tr>
                    <td>Winning Lender</td>
                    <td>{findParam("winning_lender",app.params['global-state']).bytestd}</td>
                </tr>
            </tbody>
        </Table>
    </>)
}

export default AuctionInfo;