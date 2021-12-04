import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Navbar } from 'react-bootstrap'
import MyAlgoConnect from '@randlabs/myalgo-connect'
import Account from './Account'

const wallet = new MyAlgoConnect();

function NavigationBar(props) {
    return (
        <Navbar className="bg-light justify-content-between">
            <Navbar.Brand variant="primary">NFT Loans</Navbar.Brand>
            <Navbar.Text> <Account wallet={wallet} account={props.account} setAccount={props.setAccount}/> </Navbar.Text>
        </Navbar>
    );
}

export default NavigationBar;