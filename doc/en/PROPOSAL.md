# Proposed Project for Algorand LatAm Hackathon - Dad and Daughter Team

## Introduction

We are implementing a decentralized Non-Fungible Token (NFT) mortgage lending application. We assume that an NFT can be a valuable asset, which can be used as collateral to obtain a loan against. 

In a different project we have encapsulated legal agreements as NFTs, such as house titles, car leases etc. 

Now we are are allowing the user to deposit those NFTs as collateral and obtain fungible assets against them. Those fungible assets can be further deployed in various DeFi yield farming protocols, or used outside of the blockchain for other purposes.

## Implementation

The Decentralized Application (DApp) uses the Algorand blockchain as well as a web interface, accessible over the Internet.

The business logic of the application is implemented as Algorand smart contract.

The front end is running in the user's browser as JavaScript code. This code is served as static content from IPFS (Inter-Planetary File System), and as such it is immutable and not prone to front-end code modification attacks.

### Implementation and Usage Lifecycle

The following diagram shows the deployment and usage lifetime of the application.

![Lifecycle](Development%20and%20Usage%20Process.png)

In the first column, the contracts written in PyTeal are compiled into TEAL code understandable by Algorand an deployed to the blockchain.

In the second column, the front-end, written in JavaScript and using React, js-algorand-sdk and the wallet APIs is packaged and deployed on IPFS. The DNS record is updated to reflect the IPFS URL, so the user can access the application by it's domain name. In the future, in addition to DNS, Ethereum Naming Service (ENS) or Unstopable Domains name sevice shall be used.

In the third column, the user can access the DApp using a browser. The browser requests the DNS pointed and IPFS hosted JavaScript code as static content. This code then accesses the Algorand blockchain and uses Algorand wallets for signing transacions before sending them to the nearest Algorand node.

### Workflow

The NFT lending process is described as follows:

![DApp Diagram](DApp%20Diagram.png)

There are two possible outcomes: successful repayment or liquidation:

![DApp Diagram](DApp%20Repay.png)

The owner deposits the NFT along with the terms. The lender accepts the terms and lends the money in form of an Algorand ASA token. Once the owner repays the debt determined in the terms, the NFT is returned to the owner.

![DApp Diagram](DApp%20Liquidate.png)

If the NFT does not repay the debt timely within the deadline, upon request of the lender the NFT is transferred to the lender as part of the liquidation process.

## Further Work

Time permitting we are implementing and auction for finding the most competitive lender. The lenders compete in an auction for the lowest repayment amount of the loan. At the end of the auction, the most competitive proposer gets to provide the loan collateralized by the owner's NFT.
