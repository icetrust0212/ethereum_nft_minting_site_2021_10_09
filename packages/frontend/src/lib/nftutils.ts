require('dotenv').config();
const CONTRACT_INFO = require('../contracts.json');
const NETWORK = CONTRACT_INFO.chainId;
const CONTRACT_ABI = CONTRACT_INFO.contracts.Iceberg.abi;
const CONTRACT_ADDRESS = CONTRACT_INFO.contracts.Iceberg.address;

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
export const web3 = createAlchemyWeb3(API_URL);


export const nftContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

export async function mintNFT(address: string, mintPricePerToken: number, amount: number = 1) {
  console.log('address: ', address)
  
  const nonce = await web3.eth.getTransactionCount(address, 'latest'); //get latest nonce
  // const price = await nftContract.methods.getMintPrice();
  // console.log('price: ', price);
  const priceWei = web3.utils.toWei(mintPricePerToken * amount + "", "ether"); // Convert to wei value
  //the transaction
  const tx = {
    'from': address,
    'to': CONTRACT_ADDRESS,
    'gas': 500000,
    "value": priceWei,
    'maxPriorityFeePerGas': 1999999987,
    'data': nftContract.methods.requestRandomNFT(address, amount).encodeABI()
  };
  web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}

export async function withdrawEth(address: string) {
  const tx = {
    'from': address,
    'to': CONTRACT_ADDRESS,
    'data': nftContract.methods.withdrawAll().encodeABI()
  };
  web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
  await web3.eth.accounts.signTransaction(tx, `0x${process.env.REACT_APP_ACCOUNT_PRIVATE_KEY}`);
}

export async function setPause(address: string, value: boolean) {
  const tx = {
    'from': address,
    'to': CONTRACT_ADDRESS,
    'data': nftContract.methods.setPause(value + "").encodeABI()
  };
  web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
  await web3.eth.accounts.signTransaction(tx, `0x${process.env.REACT_APP_ACCOUNT_PRIVATE_KEY}`);
}

export async function addWhiteList(address: string, _address: string) {
  const tx = {
    'from': address,
    'to': CONTRACT_ADDRESS,
    'data': nftContract.methods.addWhiteList(_address).encodeABI()
  };
  web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
  await web3.eth.accounts.signTransaction(tx, `0x${process.env.REACT_APP_ACCOUNT_PRIVATE_KEY}`);
}

export async function removeWhiteList(address: string, _address: string) {
  const tx = {
    'from': address,
    'to': CONTRACT_ADDRESS,
    'data': nftContract.methods.removeWhiteList(_address).encodeABI()
  };
  web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
  await web3.eth.accounts.signTransaction(tx, `0x${process.env.REACT_APP_ACCOUNT_PRIVATE_KEY}`);
}