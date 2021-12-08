import { waitForConfirmation } from "./waitForConfirmation"

const signSendAwait = async (txn, wallet, algodClient, refreshAccountInfo) => {
    try {
        const signedTxn = await wallet.signTransaction(txn.toByte())
        try {
            const { txId } = await algodClient.sendRawTransaction(signedTxn.blob).do()
            try {
                const confirmedTxn = await waitForConfirmation(algodClient, txId, 3)
                console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
                refreshAccountInfo()
                return(confirmedTxn)
            } catch (e) {
                console.log(e); 
                window.alert("Not confirmed in 3 rounds.")
                return(0)
            }
        } catch(e) { 
            console.log(e); 
            window.alert("Error:\n" + e.message); 
            return(0) 
        }
    } catch(e) { return(0) }
}

export default signSendAwait;