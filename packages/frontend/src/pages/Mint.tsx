import { useCallback, useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAddress, getChainId, getNFTContractInstance, getProvider, getWeb3Instance, getWeb3Provider, getWSSNFTContractInstance, getWSSWeb3Instance, getContractAddress, getContractABI } from '../store/reducers'
import { mintNFT, withdrawEth, addWhiteList, removeWhiteList, setPauseSell } from '../lib/nftutils';
//@ts-ignore
import NumericInput from 'react-numeric-input';
import '../assets/scss/mint.scss';
import { config } from '../config'
import CustomButton from '../components/Button/Button';

export const MintPage = ({handleNotification}: PropsType): JSX.Element => {
  const provider = useSelector(state => getProvider(state));
  const address = useSelector(state => getAddress(state));
  // const chainId = useSelector(state => getChainId(state));
  const web3Instance = useSelector(state => getWeb3Instance(state));
  // const wssWeb3Instance = useSelector(state => getWSSWeb3Instance(state));
  const nftContractInstance = useSelector(state => getNFTContractInstance(state));
  const wssNFTContractInstance = useSelector(state => getWSSNFTContractInstance(state));
  const contractAddress = useSelector(state => getContractAddress(state));
  // const contractABI = useSelector(state => getContractABI(state))

  const [address1, setAddress1] = useState(''); // address that will be added whitelist
  const [address2, setAddress2] = useState(''); // address that will be removed whitelist 
  const [amount, setAmount] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSettingPause, setIsSettingPause] = useState(false);
  const [isAddingWhitelist, setIsAddingWhitelist] = useState(false);
  const [isRemovingWhitelist, setIsRemovingWhitelist] = useState(false);
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
      setIsMinting(false)
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
      setIsSettingPause(false);
    }).on('error', (error: any) => {
      setIsSettingPause(false);
      handleNotification('error', `Setting Pause/Play is failed`);
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
      setIsAddingWhitelist(false);
    }).on('error', (error:any) => {
      handleNotification('error', `Adding whitelist is failed`);
      setIsAddingWhitelist(false);
    });

    wssNFTContractInstance.events.RemovedWhiteList({filter: {_to: config.PUBLIC_KEY}})
    .on('data', (event: any) => {
      console.log('Removed WhiteList: ', event, event.returnValues);
      handleNotification('success', `${event.returnValues._address} is removed to Whitelist`);
      setIsRemovingWhitelist(false);
    }).on('error', (error:any) => {
      handleNotification('error', `Removing whitelist is failed`);
      setIsRemovingWhitelist(false);
    });;

  }, [provider]);

  const mint = useCallback(() => {
    console.log('amount: ', amount);
    setIsMinting(true);
    mintNFT(web3Instance, nftContractInstance, address, contractAddress, price, amount).then(res => {
    }).catch(e => setIsMinting(false));
  }, [provider, amount]);

  const withdraw = useCallback(() => {
    setIsWithdrawing(true);
    withdrawEth(web3Instance, nftContractInstance, contractAddress).then(res => setIsWithdrawing(false)).catch(e => setIsWithdrawing(false));
  }, [provider]);
  
  const addWhiteListAddress = useCallback(() => {
    setIsAddingWhitelist(true);
    addWhiteList(web3Instance, nftContractInstance, contractAddress, address1).then(res => setIsAddingWhitelist(false)).catch(e => setIsAddingWhitelist(false));
  }, [provider, address1]);

  const removeWhiteListAddress = useCallback(() => {
    setIsRemovingWhitelist(true);
    removeWhiteList(web3Instance, nftContractInstance, contractAddress, address2).then(res => setIsRemovingWhitelist(false)).catch(e => setIsRemovingWhitelist(false));
  }, [provider, address2]);

  const setPause = useCallback(() => {
    setIsSettingPause(true);
    setPauseSell(web3Instance, nftContractInstance, contractAddress, true).then(res => setIsSettingPause(false)).catch(e => setIsSettingPause(false));
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
                <CustomButton text="Mint" onClick={mint} isLoading={isMinting} />
          </div>
          {
            isAdmin && (
              <div className="button-group" style={{display:'block', marginTop: '40px'}}>
                <h3>Admin</h3>
                <div style={{display: 'flex'}}>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <CustomButton text="Withdraw" onClick={withdraw} isLoading={isWithdrawing} />
                  </div>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <CustomButton text="Pause/Play" onClick={setPause} isLoading={isSettingPause} />
                  </div>
                </div>
                <div style={{display: "flex",flexDirection:'column'}}>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <input type="text" className="input" value={address1} onChange={(e) => {setAddress1(e.target.value)}}></input>
                    <CustomButton text="Add to Whitelist" onClick={addWhiteListAddress} isLoading={isAddingWhitelist} />
                  </div>
                  <div className="btn-layout" style={{margin: '10px'}}>
                    <input type="text" className="input" value={address2} onChange={(e) => {setAddress2(e.target.value)}}></input>
                    <CustomButton text="Remove from Whitelist" onClick={removeWhiteListAddress} isLoading={isRemovingWhitelist} />
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