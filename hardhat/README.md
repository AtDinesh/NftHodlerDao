# DAO_onchain

In this project, we want to create a DAO for the holders of a specific NFT collection.
- Anyone who owns a DAOHodler NFT can create a proposal to purchase a different NFT from an NFT marketplace
- All owners of a DAOHodler NFT can vote for or against the active proposals (1 NFT = 1 vote/proposal)
- If majority of the voters vote in favor of the proposal by the deadline, the NFT purchase happens automatically from the marketplace
- We simulate a fake NFT Marketplace that behaves like a real one.
- A simple website will be built using Next.js to allow users to create/vote for proposals.


## Required functionalities in the DAO contract:
- We need a way to store created proposals in the contract
- Holders of the NFTs should be able to create new proposals
- Holders of the NFTS should be able to vote for or against the proposals
- Holders should be able to execute a proposal if it passed at deadline

A Proposal struct is needed to store all the information about the progress of the proposal.

Since we can have several proposals, we need to maintain a list of proposals.


## Verified contracts

You can see the verified contracts and interact with them: 
- [DaoHodlerNFT](https://sepolia.etherscan.io/address/0x34528B41e8FE72c448b26A25EB9edb0BC0082d96)
- [MockNFTMarketplace](https://sepolia.etherscan.io/address/0xab1489Ae41459e082937CE21c464234c884aAFA4)
- [NFTHodlerDAO](https://sepolia.etherscan.io/address/0xBc03987Cfb9f57b582111a8C6a5B8065A15eb674)