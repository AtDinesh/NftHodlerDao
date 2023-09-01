// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * Interface for the MockNFTMarketplace
 */
interface IMockNFTMarketplace {
    // @dev buy(): accepts ETH for the caller address
    function buy(uint256 _tokenId) external payable;

    // @dev getPrice(): returns the price of one NFT
    function getPrice() external pure returns (uint256);

    // @dev available(): is the tokenId already sold ?
    function available(uint256 _tokenId) external view returns (bool);
}