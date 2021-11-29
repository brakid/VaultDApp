import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Ethereum, RpcError } from './utils/types';
import { Route, Routes } from 'react-router-dom';
import Vault from './Vault';
import { Link } from 'react-router-dom';
import Home from './Home';
import { EXPECTED_NETWORK, POLYGON_TESTNET } from './utils/networks';
import keyImage from './key.png';
import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore/lite';
import credentials from './credentials.json';

import 'firebase/firestore';

export interface Firebase {
  firestore: Firestore,
};

// Initialize Firebase
const app = initializeApp(credentials);

const firestore = getFirestore(app);

const firebaseData: Firebase = { firestore };


export const EthereumContext = React.createContext<Ethereum>({ blockNumber: -1 });
export const FirebaseContext = React.createContext<Firebase>(firebaseData);

const App = () => {
  const [web3Provider, setWeb3Provider] = useState<ethers.providers.Web3Provider>();
  const [blockNumber, setBlockNumber] = useState<number>(-1);
  const [error, setError] = useState<string>('');
  const [wrongNetwork, setWrongNetwork] = useState<boolean>(false);

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
        
        setWrongNetwork(network.name !== EXPECTED_NETWORK);

        web3Provider.addListener('network', (_, oldNetwork) => {
          if (oldNetwork) {
            window.location.reload();
          }
        });
      }
    };

    init();
  }, []);

  const changeNetwork = async () => {
    if (!!!web3Provider) {
      return;
    }

    try {
      await web3Provider.jsonRpcFetchFunc('wallet_switchEthereumChain', [{ chainId: POLYGON_TESTNET.chainId }]);
    } catch (err) {
      const rpcError = err as RpcError;
      
      if (rpcError.code === 4902) {
        try {
          await web3Provider.jsonRpcFetchFunc(
              'wallet_addEthereumChain',
              [POLYGON_TESTNET]);
        } catch (err) {
          setError('' + err);
        }
      } else {
        setError('' + err);
      }
    }
  }

  return (
    <FirebaseContext.Provider value={ firebaseData }>
      <EthereumContext.Provider value={{ web3Provider, blockNumber }}>
        <div className='container mx-auto max-w-screen-sm px-4'>
          <nav className='flex sm:flex-row flex-col items-center py-4 mb-6 border-b-2 border-black'>
            <Link to='/'><h1 className='text-center text-2xl'>Vault App</h1></Link>
            <div className='sm:justify-center sm:py-0 sm:px-4 py-2'><img className='mx-auto' width='25px' src={ keyImage } alt='Key' /></div>
          </nav>
          { !!!web3Provider && 
            <p className='py-4 px-4 my-4 bg-red-100 text-red-700 border-black border-2'>Error: No Web3 Provider found, ensure that you have installed a Web3 provider such as Metamask.</p>
          }
          { wrongNetwork && 
            <div className='flex sm:flex-row flex-col items-center py-4 px-4 my-4 bg-red-100 text-red-700 border-black border-2'>
              <p>Error: Expecting to be on the Polygon Testnet</p>
              <button className='bg-gray-100 hover:bg-gray-200 text-black m-4 py-2 px-4 border-black border-2' onClick={ () => changeNetwork() }>Change network</button>
            </div>
          }
          { error.length > 0 && 
            <p className='py-4 px-4 my-4 bg-red-100 text-red-700  border-black border-2'>Error: { error }</p>
          }
          { !!!wrongNetwork && error.length === 0 && web3Provider && 
            <section className='py-4 px-4 my-4 '>
              <Routes>
                <Route path="/" element={ 
                  <Home />
                } />
                <Route path="/vault/:id" element={ 
                  <Vault /> 
                } />
              </Routes>
            </section>
          }
          <footer className='sm:flex sm:space-evenly py-4 mt-6 border-t-2 border-black'>
            <p className='sm:flex-1 sm:text-left text-center'><a href='https://mumbai.polygonscan.com/token/0xd9fdd544c7db7a69d87755cc702dee49e44c4857' target='_blank' rel="noreferrer">Token contract</a></p>
            <p className='sm:flex-1 sm:text-right text-center'><a href='https://www.hagen-schupp.me' target='_blank' rel="noreferrer">Hagen Schupp, 2021</a></p>
          </footer>
        </div>
      </EthereumContext.Provider>
    </FirebaseContext.Provider>
  );
}

export default App;