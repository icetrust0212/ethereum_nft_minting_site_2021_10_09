import { useCallback, useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAddress, getChainId, getProvider, getWeb3Provider } from '../store/reducers'
import { mintNFT, web3, nftContract, withdrawEth, addWhiteList, removeWhiteList, setPauseSell } from '../lib/nftutils';
//@ts-ignore
import NumericInput from 'react-numeric-input';
import '../assets/scss/mint.scss';

export const MintPage = ({handleNotification}: PropsType): JSX.Element => {
  const provider = useSelector(state => getProvider(state));
  const address = useSelector(state => getAddress(state));
  const chainId = useSelector(state => getChainId(state));
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [amount, setAmount] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const price = 0.02;
  const maxAmount = 20;
  
  useEffect(() => {
    if (!provider) {
      handleNotification('warning', 'You are not connected on this site');
    } else {
      handleNotification('success', 'Connected!');
      console.log('address: ', address);
      console.log('address: ', process.env.REACT_APP_ACCOUNT_PUBLIC_KEY);
      if (address === process.env.REACT_APP_ACCOUNT_PUBLIC_KEY) {
        setIsAdmin(true);
      }
    }
  }, [provider]);

  const mint = useCallback(() => {
    console.log('amount: ', amount)
    mintNFT(address, price, amount).then(res => console.log('mint success: ', res)).catch(e => {
      console.log('mint error: ', e);
    });
  }, [provider, amount]);

  const withdraw = useCallback(() => {
    withdrawEth(address);
  }, [provider]);
  
  const addWhiteListAddress = useCallback(() => {
    addWhiteList(address, address1);
  }, [provider]);

  const removeWhiteListAddress = useCallback(() => {
    removeWhiteList(address, address1);
  }, [provider]);

  const setPause = useCallback(() => {
    setPauseSell(address, true);
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
            !isAdmin && (
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