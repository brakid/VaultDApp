import { useContext, useEffect, useState } from 'react';
import { EthereumContext } from './App';
import { Ethereum, VaultTokenContract } from './utils/types';
import { getVaultTokenContract } from './utils/contracts';
import { Link } from 'react-router-dom';

const Home = () => {
  const ethereumContext = useContext<Ethereum>(EthereumContext);
  const [vaultTokenContract, setVaultTokenContract] = useState<VaultTokenContract>();

  useEffect(() => {
    const init = async () => {
      if (ethereumContext.web3Provider) {
        setVaultTokenContract(getVaultTokenContract(ethereumContext.web3Provider.getSigner()));
      }
    };

    init();
  }, [ethereumContext]);

  return (
    <div>
      <h1 className='text-center text-xl'>All Vaults:</h1>
      <ul className='grid grid-cols-1 sm:grid-cols-3 justify-items-center gap-4'>
        { vaultTokenContract?.tokenIds.map((id, index) => {
          return (
            <li key={ index }><Link to={ '/vault/' + id.toString() }><button className='bg-yellow-300 hover:bg-yellow-400 text-black py-2 px-4 border-black border-2'>Vault { id.toString() }</button></Link></li>
          );
        }) }
      </ul>
    </div>
  );
}

export default Home;