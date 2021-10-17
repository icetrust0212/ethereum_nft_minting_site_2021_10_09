import { providers } from 'ethers'
import { useCallback, useEffect } from 'react';
import Button from './Button';
import Web3Modal from 'web3modal'
import { useDispatch, useSelector } from 'react-redux';
import { getAddress, getChainId, getProvider, getWeb3Provider } from '../../store/reducers';
import { resetWeb3Provider, setAddress, setChainId, setWeb3Provider } from '../../store/actions'
import { web3ProviderOptions } from '../../config'

let web3Modal:any;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: false,
    providerOptions: web3ProviderOptions, // required
  })
}

const ConnectButton = () => {
    const dispatch = useDispatch();
    const provider = useSelector(state => getProvider(state));
    const web3Provider = useSelector(state => getWeb3Provider(state));
    const address = useSelector(state => getAddress(state));
    const chainId = useSelector(state => getChainId(state));

    const connect = useCallback(async function () {
        // This is the initial `provider` that is returned when
        // using web3Modal to connect. Can be MetaMask or WalletConnect.
        const provider = await web3Modal.connect()
    
        // We plug the initial `provider` into ethers.js and get back
        // a Web3Provider. This will add on methods from ethers.js and
        // event listeners such as `.on()` will be different.
        const web3Provider = new providers.Web3Provider(provider)
    
        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()
    
        const network = await web3Provider.getNetwork();
    
        dispatch(setWeb3Provider(provider, web3Provider, address, network.chainId))
      }, []);

      const disconnect = useCallback(
        async function () {
          await web3Modal.clearCachedProvider()
          if (provider) {
            if (provider.disconnect && typeof provider.disconnect === 'function') {
              await provider.disconnect()
            }
            dispatch(resetWeb3Provider());
          }
        },
        [provider]
      )

      useEffect(() => {
        if (web3Modal.cachedProvider) {
          connect()
        }
      }, [connect])


      useEffect(() => {
        if (provider && provider.on) {
          const handleAccountsChanged = (accounts: string[]) => {
            // eslint-disable-next-line no-console
            console.log('accountsChanged', accounts)
            dispatch(setAddress(accounts[0]));
          }
    
          const handleChainChanged = (chainIdHex: string) => {
            // eslint-disable-next-line no-console
            let chainId = parseInt(chainIdHex)
            console.log('chainChanged', chainIdHex, chainId);
            dispatch(setChainId(chainId));
          }
    
          const handleDisconnect = (error: { code: number; message: string }) => {
            // eslint-disable-next-line no-console
            console.log('disconnect', error)
            disconnect()
          }
    
          provider.on('accountsChanged', handleAccountsChanged)
          provider.on('chainChanged', handleChainChanged)
          provider.on('disconnect', handleDisconnect)
    
          // Subscription Cleanup
          return () => {
            if (provider.removeListener) {
              provider.removeListener('accountsChanged', handleAccountsChanged)
              provider.removeListener('chainChanged', handleChainChanged)
              provider.removeListener('disconnect', handleDisconnect)
            }
          }
        }
      }, [provider, disconnect])

     function ellipseAddress(address = '', width = 5): string {
        if (!address) {
          return ''
        }
        return `${address.slice(0, width)}...${address.slice(-width)}`
    }
      
    return (
            web3Provider ? (
            <div style={{display:"flex", alignItems:'center'}}>
              <button className="button button-primary button-wide-mobile button-sm" type="button" onClick={disconnect}>
                Disconnect
              </button>
              <span style={{marginLeft:"20px", display:'block'}}>{ellipseAddress(address)}</span>
            </div>
          ) : (
            <button className="button button-primary button-wide-mobile button-sm" type="button" onClick={connect}>
              Connect
            </button>
          )
    )
}

export default ConnectButton;