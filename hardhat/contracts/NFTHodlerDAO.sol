// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";

// We need an interface of MockNFTMarketplace contract to call its functions
import "./interfaces/IMockNFTMarketplace.sol";
// For vote mechanisms we need some methods related to the NFT
import "./interfaces/IDaoHodlerNFT.sol";

contract NFTHodlerDAO is Ownable {
    // Proposal structs contains all relevant info
    struct Proposal {
        // the tokenID of the NFT to purchase
        // from MockNFTMarketplace if the proposal passes
        uint256 nftTokenId;
        // Author of the proposal
        address proposer;
        // UNIX timestamp until which this proposal is active. 
        // Proposal can be executed after the deadline has been exceeded.
        uint256 deadline;
        // count of votes in favor of the proposal
        uint256 okVotes;
        // count of votes against the proposal
        uint256 nokVotes;
        // whether or not this proposal has been executed yet. 
        // Cannot be executed before the deadline has been exceeded.
        bool executed;
        // whether or not this proposal has been canceled.
        bool canceled;

        // mapping indicating whether the NFT has already voted.
        mapping (uint256 => bool) voters;
    }

    // mapping of ID to proposal
    mapping (uint256 => Proposal) public proposals;
    // number of created proposals
    uint256 public numProposals;

    // store contracts we need to call functions of
    IMockNFTMarketplace mockNftMarketplace;
    IDaoHodlerNFT daoHodlerNft;

    // constructor which initializes the contract instances for FakeNFTMarketplace and CryptoDevsNFT
    // payable allows this constructor to accept an ETH deposit when being deployed
    constructor(address _mockNftMarketplace, address _daoHodlerNft) payable {
        mockNftMarketplace = IMockNFTMarketplace(_mockNftMarketplace);
        daoHodlerNft = IDaoHodlerNFT(_daoHodlerNft);
    }

    // modifier allows only owners of at least 1 nft to call functions
    modifier onlyDaoHodlerNftOwner() {
        require(daoHodlerNft.balanceOf(msg.sender) > 0, "Not a DaoHodlerNFT owner");
        _;
    }

    /// @dev createProposal allows DaoHodlerNFT owners to create a proposal.
    /// @param _nftTokenId tokenID of the NFT to be purchased
    /// @return proposal index for the newly created proposal
    function createProposal(uint256 _nftTokenId) external onlyDaoHodlerNftOwner returns (uint256) {
        require(mockNftMarketplace.available(_nftTokenId), "NFT is not on sale");

        // create a new proposal
        Proposal storage proposal = proposals[numProposals];
        proposal.nftTokenId = _nftTokenId;
        proposal.proposer = msg.sender;
        proposal.deadline = block.timestamp + 5 minutes;
        
        numProposals++;
        return numProposals - 1;
    }


    // modifier that checks if the proposal's deadline is passed
    modifier onlyActiveProposal(uint256 _proposalId) {
        require(
            proposals[_proposalId].deadline > block.timestamp,
            "Proposal is not active"
        );
        _;
    }
    
    //enum representing possible outcomes for votes
    enum Vote {
        OK,
        NOK
    }

    /// @dev voteOnProposal allows DaoHodlerNFT owners to vote on a proposal.
    /// @param _proposalId index of the proposal to vote on
    /// @param _vote vote to cast on the proposal
    function voteOnProposal(uint256 _proposalId, Vote _vote) 
        external 
        onlyDaoHodlerNftOwner 
        onlyActiveProposal(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];

        uint256 voterNFTBalance = daoHodlerNft.balanceOf(msg.sender);
        uint256 numVotes = 0;

        for (uint256 i=0; i<voterNFTBalance; i++){
            uint256 tokenId = daoHodlerNft.tokenOfOwnerByIndex(msg.sender, i);
            if(proposal.voters[tokenId] == false) {
                numVotes++;
                proposal.voters[tokenId] = true;
            }
        }
        require(numVotes > 0, "All vote power consumed");

        (_vote == Vote.OK) ? proposal.okVotes += numVotes : proposal.nokVotes += numVotes;
    }

    // Modifier to allow function to be called only if the proposal has passed
    // and the proposal has not been executed yet
    modifier onlyPassedInactiveProposal(uint256 _proposalId) {
        require(proposals[_proposalId].deadline < block.timestamp, "Proposal still active");
        require(proposals[_proposalId].okVotes > proposals[_proposalId].nokVotes, "Proposal has not passed");
        require(proposals[_proposalId].executed == false, "Proposal has already been executed");
        _;
    }

    /// @dev executeProposal allows the author of the proposal to execute the proposal
    /// if it has passed.
    /// @param _proposalId the id of the proposal to execute.
    function executeProposal(uint256 _proposalId) 
    external
    onlyPassedInactiveProposal(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];
        
        // whether the proposal passed is already checked in modifier
        uint256 nftPrice = mockNftMarketplace.getPrice();
        require(address(this).balance > nftPrice, "Not enough funds to execute proposal");
        // execute the proposal
        
        if(!mockNftMarketplace.available(proposal.nftTokenId)){
            proposal.canceled = true;
            revert("NFT is not available anymore");
        }

        mockNftMarketplace.buy{value: nftPrice}(proposal.nftTokenId);
        proposal.executed = true;
    }

    /// @dev withdrawEther allows the contract owner (deployer)
    /// to withdraw the ether in the contract.
    function withdrawEther() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "Nothing to withdraw, empty balance");
        // cast the address of owner as payable to make it able to receive eth
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    // The following two functions allow the contract to accept ETH deposits
    // directly from a wallet without calling a function
    receive() external payable {}
    fallback() external payable {}
}