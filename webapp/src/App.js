import React from 'react'
import NavigationBar from './components/NavigationBar';
import Body from './components/Body';

function App() {
  const [account, setAccount] = React.useState("")

  return (<>
    <NavigationBar account={account} setAccount={setAccount} />
    <br />
    <Body account={account} />
  </>);
}

export default App;
