import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import {Form,Row,Col,Button,InputGroup,FormControl} from 'react-bootstrap'

function Borrower(props) {
    const [balance, setBalance] = React.useState("")
    const onCheckBalance = async () => {
console.log("Account: ")
console.log(props.account)
        const accountInfo = await props.algodClient.accountInformation(props.account.address).do();
console.log(accountInfo)
        setBalance(accountInfo.amount / 1000000.0);
    }

    return (<>
        <Form>
        <InputGroup className="mb-2">
                <InputGroup.Text>Algo</InputGroup.Text>
                <FormControl id="inlineFormInputGroup" placeholder="Balance" value={balance} />
                <Button onClick={onCheckBalance}>Check</Button>
        </InputGroup>
        </Form>
        </>);
}

export default Borrower;