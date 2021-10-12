import { providers } from 'ethers'
import { useCallback, useEffect, useReducer } from 'react'
import Web3Modal from 'web3modal'
import { ellipseAddress, getChainData } from '../lib/utilities'
import { resetWeb3Provider, setAddress, setChainId, setWeb3Provider } from '../store/actions'
import { useDispatch, useSelector } from 'react-redux';
import { web3ProviderOptions } from '../config'
import { getAddress, getChainId, getProvider, getWeb3Provider } from '../store/reducers'
import { mintNFT, web3, nftContract, withdrawEth } from '../lib/nftutils';

let web3Modal: any;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true,
    providerOptions: web3ProviderOptions, // required
  })
}

export const Home = (): JSX.Element => {
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
    console.log("address: ", address)

    dispatch(setWeb3Provider(provider, web3Provider, address, network.chainId))
  }, [])

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

  const mint = useCallback(() => {
    mintNFT(address, 0.02, 1).then(res => console.log('mint success: ', res)).catch(e => {
      console.log('mint error: ', e);
    });
  }, [provider]);

  const withdraw = useCallback(() => {
    withdrawEth(address);
  }, [provider])

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])

  // A `provider` should come with EIP-1193 events. We'll listen for those events
  // here so that when a user switches accounts or networks, we can update the
  // local React state with that new information.
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

  const chainData = getChainData(chainId)

  return (
    <div className="container">
      <div className="header">
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </div>

      <header>
        {address && (
          <div className="grid">
            <div>
              <p className="mb-1">Network:</p>
              {
                chainData && <p>{chainData.name}</p>
              }
            </div>
            <div>
              <p className="mb-1">Address:</p>
              <p>{ellipseAddress(address)}</p>
            </div>
          </div>
        )}
      </header>

      <main>
        <h1 className="title">Web3Modal Example</h1>
        {web3Provider ? (
          <button className="button" type="button" onClick={disconnect}>
            Disconnect
          </button>
        ) : (
          <button className="button" type="button" onClick={connect}>
            Connect
          </button>
        )}
        <button className="btn btn-mint" onClick={mint}>Mint</button>
        <button className="btn btn-withdraw" onClick={withdraw}>Withdraw</button>
      </main>
    </div>
  )
}

export default Home