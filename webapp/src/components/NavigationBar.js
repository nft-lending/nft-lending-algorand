import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Navbar } from 'react-bootstrap'
import Account from './Account'

function NavigationBar(props) {
    return (
        <Navbar className="bg-light justify-content-between">
            <Container>
                <Navbar.Brand variant="primary"> NFT Loans</Navbar.Brand>
                <Navbar.Text> <Account wallet={props.wallet} account={props.account} setAccount={props.setAccount}/> </Navbar.Text>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;