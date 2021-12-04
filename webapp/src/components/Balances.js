import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import {Table} from 'react-bootstrap'
import Asset from './Asset'

function Balances(props) {
    const [accountInfo, setAccountInfo] = React.useState(false)

    React.useEffect(() => {
        const fetchAccountInfo = async () => {
            const accountInfo = await props.algodClient.accountInformation(props.account.address).do();
            setAccountInfo(accountInfo);
        }
        fetchAccountInfo()
    }, [props.account, props.algodClient]);
    
    if (!accountInfo) return(<>Please connect.</>)
    return (<>
        <Table striped bordered hover>
            <thead>
                <tr>
                <th>Asset</th>
                <th>ID</th>
                <th>Balance</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>Algo</td>
                <td></td>
                <td>{accountInfo.amount / 1000000.0}</td>
                </tr>
                {accountInfo.assets.filter(asset => asset.amount>0).map(asset => <Asset asset={asset} algodClient={props.algodClient}/>)}
            </tbody>
        </Table>
    </>);
}

// Using: https://img.icons8.com/color/48/000000/cottage.png
// From: <a href="https://icons8.com/icon/11920/house">House icon by Icons8</a>

export default Balances;