import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap'
import OptInAsset from './OptInAsset';

function Lender(props) {
    const [applicationIndex, setApplicationIndex] = React.useState(0)
    const [repaymentAmount, setRepymentAmount] = React.useState(0.0)

    const onBid = async () => {
        return
    }

    const onLiquidate = async () => {
        return
    }

    return (<>
        <Container fluid="md">
            <Row>
                <Col>
                    <OptInAsset algodClient={props.algodClient} account={props.account} wallet={props.wallet} refreshAccountInfo={props.refreshAccountInfo} />
                </Col>
                <Col>
                    <Card border="primary" style={{ width: '18rem' }}>
                        <Card.Header>Auction: {applicationIndex}</Card.Header>
                        <Card.Body>
                            <Form>
                            <Form.Group className="mb-3">
                                    <Form.Label>Auction ID</Form.Label>
                                    <Form.Control type="number" onChange={e => setApplicationIndex(parseInt(e.target.value))} placeholder="49055308" />
                                </Form.Group>
                                <br/><br/>
                                <Form.Group className="mb-3">
                                    <Form.Label>Reayment amount</Form.Label>
                                    <Form.Control type="number" onChange={e => setRepymentAmount(parseFloat(e.target.value))} placeholder="49055308" />
                                </Form.Group>

                                <Button variant="primary" onClick={onBid}>
                                    Bid
                                </Button>
                                <br/><br/>
                                <Button variant="primary" onClick={onLiquidate}>
                                    Liquidate
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    </>);
}

export default Lender;