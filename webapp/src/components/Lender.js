import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import Balances from './Balances'
import OptInAsset from './OptInAsset';

function Lender(props) {
console.log("Lender wallet")
console.log(props.wallet)
    return (<>
        <Balances algodClient={props.algodClient} account={props.account} accountInfo={props.accountInfo} refreshAccountInfo={props.refreshAccountInfo} wallet={props.wallet} />

        <OptInAsset algodClient={props.algodClient} account={props.account} wallet={props.wallet} refreshAccountInfo={props.refreshAccountInfo} />
    </>);
}

export default Lender;