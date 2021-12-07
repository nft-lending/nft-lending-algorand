import React from 'react'
import NavigationBar from './components/NavigationBar';
import Body from './components/Body';
import { Container, Row, Col } from 'react-bootstrap'
import MyAlgoConnect from '@randlabs/myalgo-connect'

const wallet = new MyAlgoConnect();

function App() {
    const [account, setAccount] = React.useState("")

    return (
        <Container fluid="md">
            <Row>
                <Col>
                    <NavigationBar account={account} setAccount={setAccount} wallet={wallet} />
                    <br />
                    <Body account={account} wallet={wallet} />
                </Col>
            </Row>
        </Container>);
}

export default App;
