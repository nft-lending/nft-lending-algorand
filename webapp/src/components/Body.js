import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Tabs, Tab } from 'react-bootstrap'
import Borrower from './Borrower'
import Lender from './Lender'
import algosdk from 'algosdk'

const algodClient = new algosdk.Algodv2(
    '', 
//    'https://api.algoexplorer.io', 
    'https://api.testnet.algoexplorer.io', 
    ''
  );

function Body(props) {
    const [activeTab, setActiveTab] = React.useState("list");
    const [loanRoot, setLoanRoot] = React.useState("");
    const [tokenAdded, setTokenAdded] = React.useState(0);

    const onSelect = (key) => {
        setActiveTab(key);
    }

    return (
        <Tabs activeKey={activeTab} transition={false} id="noanim-tab-example" onSelect={onSelect}>
            <Tab eventKey="list" title="Borrower">
                <Borrower setActiveTab={setActiveTab} setAgrRoot={setLoanRoot} tokenAdded={tokenAdded} algodClient={algodClient} account={props.account} />
            </Tab>
            <Tab eventKey="agr" title="Lender">
                <Lender agrRoot={loanRoot} setTokenAdded={setTokenAdded} algodClient={algodClient} account={props.account} />
            </Tab>
        </Tabs>
    );
}

export default Body;