import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
const INFURA_ID = process.env.INFRA_ID;

export const web3ProviderOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID, // required
      },
    },
    'custom-walletlink': {
      display: {
        logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
        name: 'Coinbase',
        description: 'Connect to Coinbase Wallet (not Coinbase App)',
      },
      options: {
        appName: 'Coinbase', // Your app name
        networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
        chainId: 1,
      },
      package: WalletLink,
      connector: async (_:any, options: any) => {
        const { appName, networkUrl, chainId } = options
        const walletLink = new WalletLink({
          appName,
        })
        const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
        await provider.enable()
        return provider
      },
    },
  }

  const {REACT_APP_API_URL_MAINNET, REACT_APP_API_URL_KOVAN, REACT_APP_API_URL_ROPSTEN, REACT_APP_API_URL_RINKBY} = process.env;
  const {REACT_APP_WSS_URL_MAINNET, REACT_APP_WSS_URL_KOVAN, REACT_APP_WSS_URL_ROPSTEN, REACT_APP_WSS_URL_RINKBY} = process.env;
  const {REACT_APP_ACCOUNT_PRIVATE_KEY, REACT_APP_ACCOUNT_PUBLIC_KEY} = process.env;

  export const config = {
    MAINNET_API_URL: REACT_APP_API_URL_MAINNET,
    KOVAN_API_URL: REACT_APP_API_URL_KOVAN,
    ROPSTEN_API_URL: REACT_APP_API_URL_ROPSTEN,
    RINKEBY_API_URL: REACT_APP_API_URL_RINKBY,

    MAINNET_WSS_URL: REACT_APP_WSS_URL_MAINNET,
    KOVAN_WSS_URL: REACT_APP_WSS_URL_KOVAN,
    ROPSTEN_WSS_URL: REACT_APP_WSS_URL_ROPSTEN,
    RINKEBY_WSS_URL: REACT_APP_WSS_URL_RINKBY,
    
    PRIVATE_KEY: REACT_APP_ACCOUNT_PRIVATE_KEY,
    PUBLIC_KEY: REACT_APP_ACCOUNT_PUBLIC_KEY,
  }