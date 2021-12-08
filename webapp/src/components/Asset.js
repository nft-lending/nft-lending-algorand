import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import { Button } from 'react-bootstrap'
import algosdk from 'algosdk'
import signSendAwait from '../util/signSendAwait'

function Asset(props) {
    const [assetInfo, setAssetInfo] = React.useState()

    React.useEffect(() => {
        const fetchAssetInfo = async () => {
            setAssetInfo(await props.algodClient.getAssetByID(parseInt(props.asset['asset-id'])).do())
        }
        fetchAssetInfo()
    }, [props.asset, props.algodClient]);
    
    const onOptOutAset = async () => {
        const params = await props.algodClient.getTransactionParams().do()
console.log(assetInfo)
        // create unsigned transaction
        const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(props.account.address, props.account.address, assetInfo.params.creator, undefined, 0, undefined, props.asset['asset-id'], params);
        //makeApplicationClearStateTxn(props.account.address, params, props.asset['asset-id']);
        await signSendAwait(txn, props.wallet, props.algodClient, props.refreshAccountInfo)
    }

    if (!assetInfo) return(<></>);
    return (
        <tr>
        <td>{assetInfo.params.total === 1 ?
                <a href={assetInfo.params.url} target="popup">{assetInfo.params['unit-name']}</a>
                :
                assetInfo.params['unit-name']}
        </td>
        <td>{props.asset['asset-id']}</td>
        <td>{assetInfo.params.total === 1?
                props.asset.amount + " NFT"
                :
                props.asset.amount / (10 ** parseInt(assetInfo.params.decimals))}
            {" "}{props.asset.amount ===  0?<Button onClick={onOptOutAset}>Opt out</Button>:""}
        </td>
        </tr>

    );
}

export default Asset;