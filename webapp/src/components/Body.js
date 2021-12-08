import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Accordion, Tabs, Tab } from 'react-bootstrap'
import Balances from './Balances'
import Borrower from './Borrower'
import Lender from './Lender'
import algosdk from 'algosdk'
import API_KEY from '../private/API_KEY'

const algodClient = new algosdk.Algodv2(
//    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 
    { 'X-API-Key': API_KEY },
    'https://testnet-algorand.api.purestake.io/ps2',
//    'http://localhost',
//    'https://api.algoexplorer.io', 
//    'https://api.testnet.algoexplorer.io', 
//    '4001'
    ''
)

function Body(props) {
    const [activeTab, setActiveTab] = React.useState("list");
    const [loanRoot, setLoanRoot] = React.useState("");
    const [accountInfo, setAccountInfo] = React.useState()

    const refreshAccountInfo = React.useCallback(async () => {
        const accountInfo = await algodClient.accountInformation(props.account.address).do();
        setAccountInfo(accountInfo);
    }, [props.account.address])

    React.useEffect(() => {
        refreshAccountInfo()
    }, [props.account, refreshAccountInfo]);
    //Line 26:11:  The 'refreshAccountInfo' function makes the dependencies of useEffect Hook (at line 33) change on every render. To fix this, wrap the definition of 'refreshAccountInfo' in its own useCallback() Hook  react-hooks/exhaustive-deps
    
    const onSelect = (key) => {
        setActiveTab(key);
    }

    if (!accountInfo) return("Please connect.")
    return (<>
        <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
            <Accordion.Header>Balances</Accordion.Header>
            <Accordion.Body>
                <Balances algodClient={algodClient} account={props.account} accountInfo={accountInfo} refreshAccountInfo={refreshAccountInfo} wallet={props.wallet} />
            </Accordion.Body>
        </Accordion.Item>
        </Accordion> 

        <br/><br/><br/>

        <Tabs activeKey={activeTab} transition={false} id="noanim-tab-example" onSelect={onSelect}>
            <Tab eventKey="list" title="Borrower">
                <Borrower setActiveTab={setActiveTab} setAgrRoot={setLoanRoot} algodClient={algodClient} account={props.account} accountInfo={accountInfo} refreshAccountInfo={refreshAccountInfo} wallet={props.wallet} />
            </Tab>
            <Tab eventKey="agr" title="Lender">
                <Lender agrRoot={loanRoot} algodClient={algodClient} account={props.account} accountInfo={accountInfo} refreshAccountInfo={refreshAccountInfo} wallet={props.wallet} />
            </Tab>
        </Tabs>
        </>);
}

export default Body;