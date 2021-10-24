import { config } from "../config";

export async function mintNFT(web3: any, nftContractInstance: any,  address: string, CONTRACT_ADDRESS: string, mintPricePerToken: number, amount: number = 1) {
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
    'data': nftContractInstance.methods.requestRandomNFT(address, amount).encodeABI()
  };
  await web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}

export async function withdrawEth(web3: any, nftContractInstance: any, CONTRACT_ADDRESS: string) {
  const tx = {
    'from': config.PUBLIC_KEY,
    'to': CONTRACT_ADDRESS,
    'data': nftContractInstance.methods.withdrawAll().encodeABI()
  };
  await web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}

export async function setPauseSell(web3: any, nftContractInstance: any, CONTRACT_ADDRESS: string, value: boolean) {
  const tx = {
    'from': config.PUBLIC_KEY,
    'to': CONTRACT_ADDRESS,
    'data': nftContractInstance.methods.setPause(value + "").encodeABI()
  };
  await web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}

export async function addWhiteList(web3: any, nftContractInstance: any, CONTRACT_ADDRESS: string, _address: string) {
  console.log('whitelist: ', _address)
  const tx = {
    'from': config.PUBLIC_KEY,
    'to': CONTRACT_ADDRESS,
    'data': nftContractInstance.methods.addWhiteList(_address).encodeABI()
  };
  await web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}

export async function removeWhiteList(web3: any, nftContractInstance: any, CONTRACT_ADDRESS: string, _address: string) {
  const tx = {
    'from': config.PUBLIC_KEY,
    'to': CONTRACT_ADDRESS,
    'data': nftContractInstance.methods.removeWhiteList(_address).encodeABI()
  };
  await web3.eth.sendTransaction(tx, (e: any) => {
    console.log(e);
  });
}