import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Ethereum } from './utils/types';
import { Route, Routes } from 'react-router-dom';
import Vault from './Vault';
import { Link } from 'react-router-dom';
import Home from './Home';

const EXPECTED_NETWORK = 'maticmum';

export const EthereumContext = React.createContext<Ethereum>({ blockNumber: -1 });

const App = () => {
  const [web3Provider, setWeb3Provider] = useState<ethers.providers.Web3Provider>();
  const [blockNumber, setBlockNumber] = useState<number>(-1);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      if (('ethereum' in window)) {
        const windowEthereum = (window as { [key: string]: any })['ethereum'];

        await windowEthereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(windowEthereum, 'any')

        setWeb3Provider(web3Provider);

        const blockNumber = await web3Provider.getBlockNumber();
        setBlockNumber(blockNumber);

        web3Provider.addListener('block', (blockNumber) => { setBlockNumber(blockNumber) });
        const network = await web3Provider.getNetwork();
        
        setError(network.name !== EXPECTED_NETWORK);

        web3Provider.addListener('network', (_, oldNetwork) => {
          if (oldNetwork) {
            window.location.reload();
          }
        });
      }
    };

    init();
  }, []);

  return (
    <EthereumContext.Provider value={{ web3Provider, blockNumber }}>
      <div>
        <h1><Link to='/'>Vault App</Link></h1>
        { !!!web3Provider && 
          <div>
            No Web3 provider detected.
          </div>
        }
        { error && 
          <p>Expecting to be on the Polygon Testnet, see: <a href='https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask'>Polygon setup</a></p>
        }
        { !!!error && web3Provider && 
          <div>
            <Routes>
              <Route path="/" element={ 
                <Home />
              } />
              <Route path="/vault/:id" element={ 
                <Vault /> 
              } />
            </Routes>
            <div>
              <p>Blocknumber: { blockNumber }</p>
            </div>
          </div>
        }
      </div>
    </EthereumContext.Provider>
  );
}

export default App;