import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar } from 'react-bootstrap'
import MyAlgoConnect from '@randlabs/myalgo-connect'
import {CallApplTxn} from '@randlabs/myalgo-connect'
import algosdk from 'algosdk'
import Account from './Account'

const wallet = new MyAlgoConnect();
const algodClient = new algosdk.Algodv2(
        '', 
        'https://api.algoexplorer.io', 
        ''
    );
    

function NavigationBar(props) {
    const [account, setAccount] = React.useState("")

    return (
        <Navbar className="bg-light justify-content-between">
            <Navbar.Brand variant="primary">NFT Loans</Navbar.Brand>
            <Navbar.Text> <Account wallet={wallet} account={account} setAccount={setAccount}/> </Navbar.Text>
        </Navbar>
    );
}

export default NavigationBar;