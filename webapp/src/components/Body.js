import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Tabs, Tab } from 'react-bootstrap';
import Borrower from './Borrower';
import Lender from './Lender';

function Body() {
    const [activeTab, setActiveTab] = React.useState("list");
    const [loanRoot, setLoanRoot] = React.useState("");
    const [tokenAdded, setTokenAdded] = React.useState(0);

    const onSelect = (key) => {
        setActiveTab(key);
    }

    return (
        <Tabs activeKey={activeTab} transition={false} id="noanim-tab-example" onSelect={onSelect}>
            <Tab eventKey="list" title="Borrower">
                <Borrower setActiveTab={setActiveTab} setAgrRoot={setLoanRoot} tokenAdded={tokenAdded}/>
            </Tab>
            <Tab eventKey="agr" title="Lender">
                <Lender agrRoot={loanRoot} setTokenAdded={setTokenAdded}/>
            </Tab>
        </Tabs>
    );
}

export default Body;