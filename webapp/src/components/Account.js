import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import {Button} from 'react-bootstrap'

function Account(props) {
    const [isBtnDisabled, setBtnIsDisabled] = React.useState(false)

    const onClick = async () => {
        try {
            const accounts = await props.wallet.connect();
            props.setAccount(accounts[0])
            setBtnIsDisabled(true)
        } catch (_) {}
    }

    return (<>
        {props.account?"Account: " + props.account.address:<Button variant="light" disabled={isBtnDisabled} onClick={onClick}>Connect</Button>}
    </>);
}

export default Account;