import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import Balances from './Balances'

function Lender(props) {
    return (<>
        <Balances algodClient={props.algodClient} account={props.account}/>
        </>);
}

export default Lender;