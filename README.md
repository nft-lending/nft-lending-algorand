# NFT Lending Auction

NFT Lending Auction allows the owners of NFTs to obtain collateralized loans. The lenders compete in an auction for best repayment terms. The winning lender gets to provide the loan.

The back end is using only the Algorand blockchain, and as such it does not need a separate installation. For each auction and resulting loan, a new Algorand smart contract is deployed. The contract is deleted by either cancelling the auction, repayment of the loan or liquidation.

The front end can be deployed as static content, prefferrably on IPFS, in order to avoid content modification hacks. Once served, it is running JavaScript code in the browser using React.js and the Algorand JavaScript API. It uses the MyAlgo Connect Wallet in order to sign the transactions.

## Documentation

Documentation in [ENGLISH](doc/en/README.md) and [ESPAÑOL](doc/es/README.md)

## Installation (tested on Ubuntu Linux 20.04)

Before installing, node.js, npm, pytohon3 and pip3 have should be installed.

1. Clone this repository
2. Run the following command there (tested using bash):
    $ source ./install.sh
3. In the python environment just created, run:

    $ ./compile.sh

4. Install the front end:
    For testing:

        $ cd webapp

        $ npm install

        $ npm start

    For production (it only uses Algorand testnet)

        $ cd webapp

        $ npm install

        $ npm run build

        Then copy and pin the contents of the webapp/build directory to IPFS. 

Create test NFTs by running the bash scripts in the test folder:

    $ ./test/createHouseNFT.sh

## Other helpful environment setup

* Install sandbox: https://github.com/algorand/sandbox

* Sandbox installation bug workaround: https://github.com/algorand/sandbox/issues/85

* Install Visual Studio Code extension: algorand

* Install Algorand JavaScript SDK: https://github.com/algorand/js-algorand-sdk

* Install Algorand Python SDK: https://github.com/algorand/py-algorand-sdk

* Install PyTeal: https://github.com/algorand/pyteal

* Install pipenv: sudo apt install python3 python3-pip python-is-python3 pipenv

## Learn Algorand smart contracts

* PyTeal: https://developer.algorand.org/docs/get-started/dapps/pyteal/
* Sample PyTeal DApp: https://github.com/algorand/auction-demo
