import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
const REACT_APP_API_URL_MAINNET = "https://eth-mainnet.alchemyapi.io/v2/OFNLvE3zh5eHRiBh30_DNaiPDVdyhXO0"
const REACT_APP_API_URL_KOVAN = "https://eth-kovan.alchemyapi.io/v2/XicYTp2d0MFKVFxtY3V6v7zsbMt4QBYd"
const REACT_APP_API_URL_RINKBY = "https://eth-rinkeby.alchemyapi.io/v2/vAQGLxQXiYIWXYDEjHX_huSpSxhaAJs3"
const REACT_APP_API_URL_ROPSTEN = "https://eth-ropsten.alchemyapi.io/v2/UokmhuXrRl3zx0KXMOjkxOQJjviawfWl"

const REACT_APP_WSS_URL_MAINNET = "wss://eth-mainnet.alchemyapi.io/v2/OFNLvE3zh5eHRiBh30_DNaiPDVdyhXO0"
const REACT_APP_WSS_URL_KOVAN = "wss://eth-kovan.alchemyapi.io/v2/XicYTp2d0MFKVFxtY3V6v7zsbMt4QBYd"
const REACT_APP_WSS_URL_RINKBY = "wss://eth-rinkeby.alchemyapi.io/v2/vAQGLxQXiYIWXYDEjHX_huSpSxhaAJs3"
const REACT_APP_WSS_URL_ROPSTEN = "wss://eth-ropsten.alchemyapi.io/v2/UokmhuXrRl3zx0KXMOjkxOQJjviawfWl"

const REACT_APP_ACCOUNT_PUBLIC_KEY = "0x1979A0a4dBA88D90b4f1CF9fcD199EA50DE50F74";
const INFURA_ID = "9aa3d95b3bc440fa88ea12eaa4456161";

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


  export const config = {
    MAINNET_API_URL: REACT_APP_API_URL_MAINNET,
    KOVAN_API_URL: REACT_APP_API_URL_KOVAN,
    ROPSTEN_API_URL: REACT_APP_API_URL_ROPSTEN,
    RINKEBY_API_URL: REACT_APP_API_URL_RINKBY,

    MAINNET_WSS_URL: REACT_APP_WSS_URL_MAINNET,
    KOVAN_WSS_URL: REACT_APP_WSS_URL_KOVAN,
    ROPSTEN_WSS_URL: REACT_APP_WSS_URL_ROPSTEN,
    RINKEBY_WSS_URL: REACT_APP_WSS_URL_RINKBY,
    
    PUBLIC_KEY: REACT_APP_ACCOUNT_PUBLIC_KEY,
  }