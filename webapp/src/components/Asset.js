import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'

function Asset(props) {
    const [assetInfo, setAssetInfo] = React.useState(false)

    React.useEffect(() => {
        const fetchAssetInfo = async () => {
            setAssetInfo(await props.algodClient.getAssetByID(parseInt(props.asset['asset-id'])).do())
        }
        fetchAssetInfo()
    }, [props.asset, props.algodClient]);
    
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
                "NFT"
                :
                props.asset.amount / (10 ** parseInt(assetInfo.params.decimals))}
        </td>
        </tr>

    );
}

export default Asset;