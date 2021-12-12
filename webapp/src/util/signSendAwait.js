import algosdk from 'algosdk'
import { waitForConfirmation } from "./waitForConfirmation"

const signSendAwait = async (txs, wallet, algodClient, onSuccess) => {
    if (txs.length === 0) throw new Error("Empty list of transactions")
    else {
        try {
            let signedTxns = null
            if (txs.length === 1) { // Single transaction
console.log("signing single tx")
                signedTxns = await wallet.signTransaction(txs[0].toByte())
            } else { // Transaction group
                const groupID = algosdk.computeGroupID(txs)
                for (let i = 0; i < txs.length; i++) txs[i].group = groupID;           
console.log("signing multiple tx")
                signedTxns = await wallet.signTransaction(txs.map(txn => txn.toByte()));  
            }
            try {
console.log("sending txs")
                const { txId } = await algodClient.sendRawTransaction(signedTxns.blob).do()
                try {
console.log("wiaiting for conf...")
                    const confirmedTxn = await waitForConfirmation(algodClient, txId, 3)
console.log(confirmedTxn)
                    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
                    onSuccess()
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
}

export default signSendAwait;