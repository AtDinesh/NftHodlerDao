// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MockNFTMarketplace {
    // mapping of tokenID to owner addresses
    mapping (uint256 => address) public tokens;

    // buy price of fake nfts
    uint256 constant nftPrice = 0.01 ether;

    // @dev buy(): accepts ETH for the caller address
    function buy(uint256 _tokenId) external payable {
        require(msg.value == nftPrice, "Invalid price. This NFT costs 0.01 ETH");
        tokens[_tokenId] = msg.sender;
    }

    // @dev getPrice(): returns the price of one NFT
    function getPrice() external pure returns (uint256) {
        return nftPrice;
    }

    // @dev available(): is the tokenId already sold ?
    function available(uint256 _tokenId) external view returns (bool) {
        return tokens[_tokenId] == address(0);
    }
}