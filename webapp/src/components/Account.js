import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import {Button} from 'react-bootstrap'
import algosdk from 'algosdk'

const algodClient = new algosdk.Algodv2(
        '', 
        'https://api.algoexplorer.io', 
        ''
    );

function Account(props) {
    const [isBtnDisabled, setBtnIsDisabled] = React.useState(false)

    const onClick = async () => {
        const accounts = await props.wallet.connect();
        console.log(accounts);
        props.setAccount(accounts[0])
        setBtnIsDisabled(true)
    }

    console.log("State")
    console.log(props.account)
    return (<>
        {props.account?"Account: " + props.account.address:<Button variant="light" disabled={isBtnDisabled} onClick={onClick}>Connect</Button>}
    </>);
}

export default Account;