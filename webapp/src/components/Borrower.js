import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import Balances from './Balances'

function Borrower(props) {
    return (<>
        <Balances algodClient={props.algodClient} account={props.account}/>
        </>);
}

export default Borrower;