import React from 'react';
import 'bootstrap/dist/css/bootstrap.css'

function AppItem(props) {
    return (
        <tr>
        <td>AUCTION
        </td>
        <td>{props.app.id}</td>
        <td>APP
        </td>
        </tr>

    );
}

export default AppItem;