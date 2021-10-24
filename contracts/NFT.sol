// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import './ERC2981ContractWideRoyalties.sol';

contract Iceberg is ERC721Enumerable, ERC2981ContractWideRoyalties, VRFConsumerBase, Ownable {
    using SafeMath for uint256;

    uint256 public MAX_ELEMENTS = 8888;
    uint256 public constant PRICE = 0.02 ether;
    uint256 public constant START_AT = 1;

    address public constant creator1Address =
        0x5DB342FB039C1c85bec5fE89Af6734621f421D84;
    address public constant creator2Address =
        0xc09eAC15f9Ba6462e8E4612af7C431E1cfe08b87;
    address public constant devAddress =
        0x94Da7d3d5f83a7253a2B96427D69C971a4bac6dF;

    //For VRF function
    bytes32 internal keyHash;
    uint256 internal VRFFee = 0.1 * 10**18; // 0.1 LINK
    address public LinkToken;
    address public VRFCoordinator;

    //Avaiable tokenIds
    uint256[] internal tokenIds;

    //state variable for VRF
    mapping(bytes32 => address) requestToSender;
    
    //whitelist
    mapping(address => bool) whiteList;

    bool private PAUSE = false;
    string public baseTokenURI;

    event PauseEvent(bool pause);
    event welcomeToNFT(address indexed _to , uint256 id);
    event AddedWhiteList(address indexed _to, address _address);
    event RemovedWhiteList(address indexed _to, address _address);
    event RemainTokenCount(uint256 _count);
    event SoldOut();

    constructor(
        string memory baseURI,
        uint256 maxAmount,
        address _VRFCoordinator,
        address _LinkToken,
        bytes32 _keyhash
    ) ERC721("ICEBERG", "ICE") VRFConsumerBase(_VRFCoordinator, _LinkToken) {
        setBaseURI(baseURI);
        setMaxElementCount(maxAmount);
        setRoyalties(creator1Address, 1000);
        VRFCoordinator = _VRFCoordinator;
        LinkToken = _LinkToken;
        keyHash = _keyhash;
    }

    modifier saleIsOpen() {
        require(remainTokenCount() >= 0, "Soldout!");
        require(!PAUSE && !whiteList[msg.sender], "Sales not open");
        _;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    /// @inheritdoc	ERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC2981Base)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    

    /// @notice Allows to set the royalties on the contract
    /// @dev This function in a real contract should be protected with a onlOwner (or equivalent) modifier
    /// @param recipient the royalties recipient
    /// @param value royalties value (between 0 and 10000)
    function setRoyalties(address recipient, uint256 value) public {
        _setRoyalties(recipient, value);
    }


    //init token ids
    function _initTokenIds() internal {
        for (uint256 i = 0; i < MAX_ELEMENTS; i++) {
            tokenIds.push(i);
        }
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        baseTokenURI = baseURI;
    }

    function remainTokenCount() public view returns (uint256) {
        return tokenIds.length;
    }

    function mintedTokenCount () public view returns(uint256) {
        return MAX_ELEMENTS - remainTokenCount();
    }

    //Endpoint for mint nft
    function requestRandomNFT(address _to, uint8 amount)
        public
        payable
        saleIsOpen
    {
        uint256 total = mintedTokenCount();
        require(amount <= 2, "Max limit");
        require(total + amount <= MAX_ELEMENTS, "Max limit");
        require(msg.value >= price(amount), "Value below price");
        require(
            LINK.balanceOf(address(this)) >= VRFFee * amount,
            "Not enough LINK - fill contract with faucet"
        );

        for (uint8 i = 0; i <= amount - 1; i++) {
            bytes32 requestId = requestRandomness(keyHash, VRFFee);
            requestToSender[requestId] = _to;
        }
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        uint256 index = randomness % tokenIds.length;
        address _to = requestToSender[requestId];
        mint(_to, tokenIds[index]);
        uint256 _count = remainTokenCount();
        if (_count > 0) {
            emit RemainTokenCount(_count);
        } else {
            emit SoldOut();
        }

    }

    function mint(address _to, uint256 _tokenId) private {
        _mintAnElement(_to, _tokenId);
        _removeTokenId(_tokenId);
    }

    function _mintAnElement(address _to, uint256 _tokenId) private {
        _safeMint(_to, _tokenId);
        emit welcomeToNFT(_to, _tokenId);
    }

    function price(uint256 _count) public pure returns (uint256) {
        return PRICE.mul(_count);
    }

    function walletOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(_owner);

        uint256[] memory tokensId = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    function setPause(bool _pause) public onlyOwner {
        PAUSE = _pause;
        emit PauseEvent(PAUSE);
    }

    function getPause() public view returns(bool) {
        return PAUSE;
    }

    function withdrawAll() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        // _widthdraw(devAddress, balance.mul(0).div(100));
        _widthdraw(creator2Address, balance.mul(100).div(100));
        // _widthdraw(creator1Address, address(this).balance);
    }

    function _widthdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Transfer failed.");
    }

    function getUnsoldTokens(uint256 offset, uint256 limit)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory tokens = new uint256[](limit);

        for (uint256 i = 0; i < limit; i++) {
            uint256 key = i + offset;
            if (rawOwnerOf(key) == address(0)) {
                tokens[i] = key;
            }
        }

        return tokens;
    }

    function mintUnsoldTokens(uint256[] memory _tokensId) public onlyOwner {
        require(PAUSE, "Pause is disable");

        for (uint256 i = 0; i < _tokensId.length; i++) {
            if (rawOwnerOf(_tokensId[i]) == address(0)) {
                _mintAnElement(owner(), _tokensId[i]);
            }
        }
    }

    function setMaxElementCount(uint256 _maxElements) public onlyOwner {
        MAX_ELEMENTS = _maxElements;
        _initTokenIds();
    }

    function _findTokenIdIndex(uint256 _tokenId)
        internal
        view
        returns (uint256)
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 _id = tokenIds[i];
            if (_id == _tokenId) {
                return i;
            }
        }
        return tokenIds.length + 100;
    }

    //remove minted token id
    function _removeTokenId(uint256 _tokenId) internal {
        require(tokenIds.length > 0, "tokenIds is empty");
        //get index for _tokenId
        uint256 index = _findTokenIdIndex(_tokenId);
        require(
            index <= tokenIds.length,
            "Cannot find tokenIds Index - removeTokenId"
        );
        // Move the last element into the place to delete
        tokenIds[index] = tokenIds[tokenIds.length - 1];
        // Remove the last element
        tokenIds.pop();
    }

    //add whitelist
    // function addWhiteList(address _address) public onlyOwner {
    //     require(!whiteList[_address], "Already Added");
    //     whiteList[_address] = true;
    //     emit AddedWhiteList(owner() ,_address);
    // }
    // function isWhiteList(address _address) public view onlyOwner returns(bool) {
    //     return whiteList[_address];
    // }
    // //remove whitelist
    // function removeWhiteList(address _address) public onlyOwner {
    //     require(whiteList[_address], "Already removed");
    //     whiteList[_address] = false;
    //     emit RemovedWhiteList(owner(), _address);
    // }
}
