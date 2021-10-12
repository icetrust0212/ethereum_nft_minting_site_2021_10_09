// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";
import "hardhat/console.sol";
/**
 * @title Creature
 * Creature - a contract for my non-fungible creatures.
 */
contract MyNFT is ERC721Tradable {
    string internal openseaContractUri;
    constructor(
        address _proxyRegistryAddress,
        string memory _contractUri,
        string memory _metadataUri,
        string memory _name,
        string memory _symbol,
        uint256  _tokenAmount,
        address _VRFCoordinator,
        address _LinkToken,
        bytes32 _keyhash
    ) ERC721Tradable(_name, _symbol, _proxyRegistryAddress, _VRFCoordinator, _LinkToken, _keyhash) {
        _setBaseURI(_metadataUri);
        _setContractURI(_contractUri);
        _setTokenAmount(_tokenAmount);
        setMintPrice(0.03 * 10 ** 18);
    }

    
}
