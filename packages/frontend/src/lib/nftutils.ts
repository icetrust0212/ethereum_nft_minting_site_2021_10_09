require('dotenv').config();
const CONTRACT_INFO = require('../contracts.json');
const NETWORK = CONTRACT_INFO.chainId;
const CONTRACT_ABI = CONTRACT_INFO.contracts.MyNFT.abi;
const CONTRACT_ADDRESS = CONTRACT_INFO.contracts.MyNFT.address;

const MAINNET = "1"
const ROPSTEN = "3";
const RINKBY = "4";
const KOVAN = "42";

let API_URL;
const {REACT_APP_API_URL_MAINNET, REACT_APP_API_URL_KOVAN, REACT_APP_API_URL_ROPSTEN, REACT_APP_API_URL_RINKBY} = process.env;
switch(NETWORK) {
  case MAINNET:
    API_URL = REACT_APP_API_URL_MAINNET;
    break;
  case KOVAN:
    API_URL = REACT_APP_API_URL_KOVAN;
    break;
  case RINKBY:
    API_URL = REACT_APP_API_URL_RINKBY;
    break;
  case ROPSTEN:
    API_URL = REACT_APP_API_URL_ROPSTEN;
    break;
}

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);


const nftContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

export async function mintNFT(address: string, amount: number = 1) {
  console.log('address: ', address)
  const nonce = await web3.eth.getTransactionCount(address, 'latest'); //get latest nonce
  //the transaction
  const tx = {
    'from': address,
    'to': CONTRACT_ADDRESS,
    'nonce': nonce,
    'gas': 500000,
    'maxPriorityFeePerGas': 1999999987,
    // 'data': nftContract.methods.mintNFT(address, tokenId, 1, []).encodeABI()
    'data': nftContract.methods.requestRandomNFT(address, amount).encodeABI()
  };
  web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}