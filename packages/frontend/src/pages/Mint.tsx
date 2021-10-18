import { useCallback, useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAddress, getChainId, getNFTContractInstance, getProvider, getWeb3Instance, getWeb3Provider, getWSSNFTContractInstance, getWSSWeb3Instance, getContractAddress, getContractABI } from '../store/reducers'
import { mintNFT, withdrawEth, addWhiteList, removeWhiteList, setPauseSell } from '../lib/nftutils';
//@ts-ignore
import NumericInput from 'react-numeric-input';
import '../assets/scss/mint.scss';
import { config } from '../config'

export const MintPage = ({handleNotification}: PropsType): JSX.Element => {
  const provider = useSelector(state => getProvider(state));
  const address = useSelector(state => getAddress(state));
  const chainId = useSelector(state => getChainId(state));
  const web3Instance = useSelector(state => getWeb3Instance(state));
  const wssWeb3Instance = useSelector(state => getWSSWeb3Instance(state));
  const nftContractInstance = useSelector(state => getNFTContractInstance(state));
  const wssNFTContractInstance = useSelector(state => getWSSNFTContractInstance(state));
  const contractAddress = useSelector(state => getContractAddress(state));
  const contractABI = useSelector(state => getContractABI(state))

  const [address1, setAddress1] = useState(''); // address that will be added whitelist
  const [address2, setAddress2] = useState(''); // address that will be removed whitelist 
  const [amount, setAmount] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const price = 0.02;
  const maxAmount = 20;
  
  useEffect(() => {
    if (!provider) {
      handleNotification('warning', 'You are not connected on this site');
    } else {
      handleNotification('success', 'Connected!');
      console.log('address: ', address);
      if (address === config.PUBLIC_KEY) {
        setIsAdmin(true);
      }
    }

    wssNFTContractInstance.events.welcomeToNFT({filter: { _to: address }})
    .on('data', (event:any) => {
      handleNotification('success', `NFT #${event.returnValues.id} is minted successfully `);
      setIsMinting(false);
      console.log('Mint result: ', event, event.returnValues);
    }).on("error", (error: any) => {
      console.error("Mint Failed", error);
      handleNotification("error", 'NFT Mint is failed');
    });

    wssNFTContractInstance.events.RemainTokenCount({})
    .on('data', (event: any) => {
      console.log('Remain Counts: ', event, event.returnValues);
      handleNotification('warning', `${event.returnValues._count} NFTs remain`);
    });

    wssNFTContractInstance.events.PauseEvent({})
    .on('data', (event: any) => {
      console.log('Minting Pause: ', event, event.returnValues);
      handleNotification('warning', `NFT minting ${event.returnValues.pause ? 'PAUSE' : 'RESUME'}`);
    });

    wssNFTContractInstance.events.SoldOut({})
    .on('data', (event: any) => {
      console.log('Sold out: ', event, event.returnValues);
      handleNotification('warning', `NFT Sold out`);
    });

    wssNFTContractInstance.events.AddedWhiteList({filter: {_to: config.PUBLIC_KEY}})
    .on('data', (event: any) => {
      console.log('Added WhiteList: ', event, event.returnValues);
      handleNotification('success', `${event.returnValues._address} is added to Whitelist`);
    });

    wssNFTContractInstance.events.RemovedWhiteList({filter: {_to: config.PUBLIC_KEY}})
    .on('data', (event: any) => {
      console.log('Removed WhiteList: ', event, event.returnValues);
      handleNotification('success', `${event.returnValues._address} is removed to Whitelist`);
    });

  }, [provider]);

  const mint = useCallback(() => {
    console.log('amount: ', amount);
    setIsMinting(true);
    mintNFT(web3Instance, nftContractInstance, address, contractAddress, price, amount).then(res => console.log('mint success: ', res)).catch(e => {
      handleNotification('error', 'NFT minting is failed');
      setIsMinting(false);
    });
  }, [provider, amount]);

  const withdraw = useCallback(() => {
    withdrawEth(web3Instance, nftContractInstance, contractAddress);
  }, [provider]);
  
  const addWhiteListAddress = useCallback(() => {
    addWhiteList(web3Instance, nftContractInstance, contractAddress, address1);
  }, [provider]);

  const removeWhiteListAddress = useCallback(() => {
    removeWhiteList(web3Instance, nftContractInstance, contractAddress, address1);
  }, [provider]);

  const setPause = useCallback(() => {
    setPauseSell(web3Instance, nftContractInstance, contractAddress, true);
  }, [provider]);

  return (
    <div className="container mint-container" style={{paddingTop:'80px'}}>
      <div className="title-wrapper">
        <h4>Welcome to the</h4>
        <h3>Mint machine</h3>
        <p>(NOT LIKE THE PLANT BUT ALL ARE GUARANTEED FRESH)</p>
      </div>
      {
        provider && (
          <>
            <div className="mint-section">
              <p>
                LIMIT {maxAmount} PER WALLET ONLY {price} ETH
              </p>
              <NumericInput
                value={amount}
                precision={0}
                size={6}
                step={1}
                mobile={true}
                max={maxAmount}
                min={1} 
                onChange={(value:any) => {
                  setAmount(value)
                }}
                style={{
                    wrap: {
                        background: 'transparent',
                        boxShadow: '0 0 1px 1px #999 inset, 1px 1px 5px -1px #000',
                        padding: '2px 2.26ex 2px 2px',
                        borderRadius: '6px 3px 3px 6px',
                        fontSize: 32
                    },
                    input: {
                        borderRadius: '4px 2px 2px 4px',
                        color: 'white',
                        padding: '0.1ex 1ex',
                        border: 'none',
                        outline:'none',
                        marginRight: 4,
                        display: 'block',
                        fontWeight: 100,
                        background: 'transparent',
                        textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)'
                    },
                    'input:focus' : {
                        border: 'none',
                        outline: 'none'
                    },
                    arrowUp: {
                        borderBottomColor: 'rgba(66, 54, 0, 0.63)'
                    },
                    arrowDown: {
                        borderTopColor: 'rgba(66, 54, 0, 0.63)'
                    }
                }}/>
              <button className="button button-primary button-wide-mobile button-md" onClick={mint}>Mint</button>
          </div>
          {
            isAdmin && (
              <div className="button-group" style={{display:'block', marginTop: '40px'}}>
                <h3>Admin</h3>
                <div style={{display: 'flex'}}>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <button className="button button-primary button-wide-mobile button-sm" onClick={withdraw}>Withdraw</button>
                  </div>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <button className="button button-primary button-wide-mobile button-sm" onClick={setPause}>Pause/Release</button>
                  </div>
                </div>
                <div style={{display: "flex",flexDirection:'column'}}>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <input type="text" className="input" value={address1} onChange={(e) => {setAddress1(e.target.value)}}></input>
                    <button className="button button-primary button-wide-mobile button-sm" onClick={addWhiteListAddress}>Add Whitelist</button>
                  </div>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <input type="text" className="input" value={address2} onChange={(e) => {setAddress2(e.target.value)}}></input>
                    <button className="button button-primary button-wide-mobile button-sm" onClick={removeWhiteListAddress}>Remove WhiteList</button>
                  </div> 
                </div>
              </div>
            )
          }
        </>
        )
      }
      </div>
  )
}

interface PropsType {
  handleNotification: any
}
export default MintPage