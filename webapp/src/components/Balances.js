import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import {Table} from 'react-bootstrap'
import Asset from './Asset'

function Balances(props) {
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
                <td>{props.accountInfo.amount / 1000000.0}</td>
                </tr>
                {props.accountInfo.assets.filter(asset => asset.amount>0).map(asset => <Asset key={asset} asset={asset} algodClient={props.algodClient}/>)}
            </tbody>
        </Table>
    </>);
}

// Using: https://img.icons8.com/color/48/000000/cottage.png
// From: <a href="https://icons8.com/icon/11920/house">House icon by Icons8</a>

export default Balances;