import {ActionType} from '../../lib/types';
import {config as web3Config} from '../../config';
import {config} from 'dotenv';
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

config();

const init = () => {
  const CONTRACT_INFO = require('../../contracts.json');
  const NETWORK = CONTRACT_INFO.chainId;

  const CONTRACT_ABI = CONTRACT_INFO.contracts.Iceberg.abi;
  const CONTRACT_ADDRESS = CONTRACT_INFO.contracts.Iceberg.address;
  
  const MAINNET = "1"
  const ROPSTEN = "3";
  const RINKEBY = "4";
  const KOVAN = "42";
  
  let API_URL: any = web3Config.MAINNET_API_URL;
  let WSS_URL: any = web3Config.MAINNET_WSS_URL;
  switch(NETWORK) {
    case MAINNET:
      API_URL = web3Config.MAINNET_API_URL;
      WSS_URL = web3Config.MAINNET_WSS_URL;
      break;
    case KOVAN:
      API_URL = web3Config.KOVAN_API_URL;
      WSS_URL = web3Config.KOVAN_WSS_URL;
      break;
    case RINKEBY:
      API_URL = web3Config.RINKEBY_API_URL;
      WSS_URL = web3Config.RINKEBY_WSS_URL
      break;
    case ROPSTEN:
      API_URL = web3Config.ROPSTEN_API_URL;
      WSS_URL = web3Config.ROPSTEN_WSS_URL;
      break;
  }
  const web3Instance = createAlchemyWeb3(API_URL);
  const wssWeb3Instance = createAlchemyWeb3(WSS_URL);
  const nftContractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  const wssNftContractInstance = new wssWeb3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  return {web3Instance, wssWeb3Instance, nftContractInstance, wssNftContractInstance, CONTRACT_ABI, CONTRACT_ADDRESS}
}

const initialState: any = {
  provider: null,
  web3Provider: null,
  address: undefined,
  chainId: undefined,
  ...init()
}

export function web3(state: any=initialState, action: ActionType): any {
  switch (action.type) {
    case 'SET_WEB3_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      }
    case 'SET_ADDRESS':
      return {
        ...state,
        address: action.address,
      }
    case 'SET_CHAIN_ID':
      return {
        ...state,
        chainId: action.chainId,
      }
    case 'RESET_WEB3_PROVIDER':
      return initialState
    default:
      return initialState;
  }
}

export const getProvider = (state:any) => {
  return state.web3.provider;
}
export const getWeb3Provider = (state: any) => {
  return state.web3.web3Provider;
}
export const getAddress = (state: any) => {
  return state.web3.address;
}
export const getChainId = (state: any) => {
  return state.web3.chainId;
}

export const getWeb3Instance = (state: any) => {
  return state.web3.web3Instance;
}

export const getWSSWeb3Instance = (state: any) => {
  return state.web3.wssWeb3Instance;
}

export const getContractAddress = (state: any) => {
  return state.web3.CONTRACT_ADDRESS;
}

export const getNFTContractInstance = (state: any) => {
  return state.web3.nftContractInstance;
}
export const getWSSNFTContractInstance = (state: any) => {
  return state.web3.wssNftContractInstance;
}
export const getContractABI = (state: any) => {
  return state.web3.CONTRACT_ABI;
}