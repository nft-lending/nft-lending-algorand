import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Tabs, Tab } from 'react-bootstrap'
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

    const refreshAccountInfo = async () => {
        const accountInfo = await algodClient.accountInformation(props.account.address).do();
        setAccountInfo(accountInfo);
    }

    React.useEffect(() => {
        refreshAccountInfo()
    }, [props.account]);
    
    const onSelect = (key) => {
        setActiveTab(key);
    }

    if (!accountInfo) return("Please connect.")
    return (
        <Tabs activeKey={activeTab} transition={false} id="noanim-tab-example" onSelect={onSelect}>
            <Tab eventKey="list" title="Borrower">
                <Borrower setActiveTab={setActiveTab} setAgrRoot={setLoanRoot} algodClient={algodClient} account={props.account} accountInfo={accountInfo} refreshAccountInfo={refreshAccountInfo} wallet={props.wallet} />
            </Tab>
            <Tab eventKey="agr" title="Lender">
                <Lender agrRoot={loanRoot} algodClient={algodClient} account={props.account} accountInfo={accountInfo} refreshAccountInfo={refreshAccountInfo} wallet={props.wallet} />
            </Tab>
        </Tabs>
    );
}

export default Body;