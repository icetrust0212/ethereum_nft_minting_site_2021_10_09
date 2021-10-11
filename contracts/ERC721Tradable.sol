// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/Strings.sol";

import "./common/meta-transactions/ContentMixin.sol";
import "./common/meta-transactions/NativeMetaTransaction.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "hardhat/console.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

/**
 * @title ERC721Tradable
 * ERC721Tradable - ERC721 contract that whitelists a trading address, and has minting functionality.
 */
abstract contract ERC721Tradable is
    ContextMixin,
    ERC721Enumerable,
    NativeMetaTransaction,
    Ownable,
    VRFConsumerBase
{
    using SafeMath for uint256;

    address proxyRegistryAddress;
    uint256 private _currentTokenId = 0;
    string internal _baseTokenURI;
    string internal _contractURI;
    uint256 internal tokenAmount = 0;

    bytes32 internal keyHash;
    uint256 internal fee;
    address public LinkToken;
    address public VRFCoordinator;
    uint256 public randomResult;
    uint256[] internal tokenIds;

    mapping(bytes32 => address) requestToSender;

    modifier lessThanTotalAmount(uint256 amount) {
        require(
            amount <= tokenAmount,
            "Should Be less or equal than total amount"
        );
        _;
    }
    modifier limitAmountPerTx(uint256 amount) {
        require(amount <= 20, "Should Be less or equal than amount per tx");
        _;
    }

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Kovan
     * Chainlink VRF Coordinator address: 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9
     * LINK token address:                0xa36085F69e2889c224210F603D836748e7dC0088
     * Key Hash: 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4
     */

    constructor(
        string memory _name,
        string memory _symbol,
        address _proxyRegistryAddress,
        address _VRFCoordinator,
        address _LinkToken,
        bytes32 _keyhash
    ) ERC721(_name, _symbol) VRFConsumerBase(_VRFCoordinator, _LinkToken) {
        proxyRegistryAddress = _proxyRegistryAddress;
        _initializeEIP712(_name);
        keyHash = _keyhash;
        VRFCoordinator = _VRFCoordinator;
        LinkToken = _LinkToken;
        fee = 0.1 * 10**18; // 0.1 LINK (Varies by network)
    }

    function requestRandomNFT(address _to, uint8 amount)
        public
        lessThanTotalAmount(amount)
        limitAmountPerTx(amount)
    {
        require(
            LINK.balanceOf(address(this)) >= fee * amount,
            "Not enough LINK - fill contract with faucet"
        );
        for (uint8 i = 0; i <= amount - 1; i++) {
            bytes32 requestId = requestRandomness(keyHash, fee);
            requestToSender[requestId] = _to;
        }
    }

    function _findTokenIdIndex(uint _tokenId) internal view returns(uint256) {
        for (uint i = 0; i < tokenIds.length ; i ++) {
            uint _id = tokenIds[i];
            if (_id == _tokenId) {
                return i;
            }
        }
        return tokenIds.length + 100;
    }
    //remove minted token id
    function _removeTokenId(uint _tokenId) internal {
        require(tokenIds.length > 0, 'tokenIds is empty');
        //get index for _tokenId
        uint index = _findTokenIdIndex(_tokenId);
        require(index <= tokenIds.length, "Cannot find tokenIds Index - removeTokenId");
        // Move the last element into the place to delete
         tokenIds[index] = tokenIds[tokenIds.length - 1];
        // Remove the last element
        tokenIds.pop();
    } 

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     */
    function mintTo(address _to, uint _tokenId) private returns (uint256) {
        _mint(_to, _tokenId);
        console.log("TokenId: ", _tokenId);
        console.log("baseuri: ", tokenURI(_tokenId));
        _removeTokenId(_tokenId);
        return _tokenId;
    }

    /**
     * @dev calculates the next token ID based on value of _currentTokenId
     * @return uint256 for the next token ID
     */
    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId.add(1);
    }

    /**
     * @dev increments the value of _currentTokenId
     */
    function _incrementTokenId() private {
        _currentTokenId++;
    }

    // function baseURI() virtual public view returns (string memory);

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        console.log(
            "tokenURI: ",
            string(
                abi.encodePacked(_baseURI(), "/", Strings.toString(_tokenId))
            )
        );
        return
            string(
                abi.encodePacked(_baseURI(), "/", Strings.toString(_tokenId))
            );
    }

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender() internal view override returns (address sender) {
        return ContextMixin.msgSender();
    }

    function _baseURI() internal view override returns (string memory) {
        console.log("baseTokenURI: ", _baseTokenURI);
        return _baseTokenURI;
    }

    function contractURI() public view returns (string memory) {
        console.log("contractURI: ", _contractURI);
        return _contractURI;
    }

    function _setBaseURI(string memory _metadataUri) public {
        _baseTokenURI = _metadataUri;
    }

    function _setContractURI(string memory _contractUri) public {
        _contractURI = _contractUri;
    }

    function _setTokenAmount(uint256 _tokenAmount) public onlyOwner {
        tokenAmount = _tokenAmount;
        //init tokenIds array
        delete tokenIds;
        for (uint256 i = 0; i < tokenAmount; i++) {
            tokenIds.push(i);
        }
    }

    function getTokenAmount() public view returns (uint256) {
        return tokenAmount;
    }

    function getAvaiableTokenAmount() public view returns (uint256) {
        return tokenIds.length;
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
        uint256 index = randomness % tokenIds.length;
        address _to = requestToSender[requestId];
        mintTo(_to, tokenIds[index]);
    }
}
