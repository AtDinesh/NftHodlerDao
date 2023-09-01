// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DaoHodlerNFT is ERC721Enumerable, Ownable {
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant PRICE = 0.001 ether;
    uint256 public constant MAX_MINT_PER_WALLET = 5;

    constructor() ERC721("DaoHodlerNFT", "DHNFT") {}

    function mint() public payable {
        require(msg.value >= PRICE, "Not enough ETH sent");
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(balanceOf(msg.sender) < MAX_MINT_PER_WALLET, "Max mint per wallet reached");
        require(totalSupply() + 1 <= MAX_SUPPLY, "Max supply reached");
        require(totalSupply() + 1 <= MAX_SUPPLY, "Max supply reached");

        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);
    }

    /**
    * @dev withdraw sends all the ether in the contract
    * to the owner of the contract
      */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value:amount}("");
        require(sent, "Failed to send Ether");
    }
}