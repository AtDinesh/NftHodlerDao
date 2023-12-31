import {
  DaoHodlerNFTABI,
  DaoHodlerNFTAddress,
  NFTHodlerDAOABI,
  NFTHodlerDAOAddress,
} from "@/constants";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { formatEther } from "viem/utils";
import { useAccount, useBalance, useContractRead } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";

import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'], display: "swap" })

export default function Home() {
  // Check if the user's Wallet is connected, and its address using Wagmi's hooks
  const { address, isConnected } = useAccount();

  // state variable to know if the component has been mounted yet or not
  const [isMounted, setIsMounted] = useState(false);

  // State variable to show loading state when waiting for a transaction to go through
  const [loading, setLoading] = useState(false);

  // Fake NFT Token ID to purchase. Used when creating a proposal.
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  // state variable to store all proposals in the DAO
  const [proposals, setProposals] = useState([]);
  // state variable to switch between the 'Create Proposal' and 'View Proposals' tabs
  const [selectedTab, setSelectedTab] = useState("");

  // Fetch the owner of the DAO
  const daoOwner = useContractRead({
    abi: NFTHodlerDAOABI,
    address: NFTHodlerDAOAddress,
    functionName: "owner",
  });

  // Fetch the balance of the DAO
  const daoBalance = useBalance({
    address: NFTHodlerDAOAddress
  });

  // Fetch the number of proposals in the DAO
  const numOfProposalsInDao = useContractRead({
    abi: NFTHodlerDAOABI,
    address: NFTHodlerDAOAddress,
    functionName: "numProposals",
  });

  // Fetch the DaoHodler NFT balance of the user
  const nftBalanceOfUser = useContractRead({
    abi: DaoHodlerNFTABI,
    address: DaoHodlerNFTAddress,
    functionName: "balanceOf",
    args: [address],
  });

  // Function to make a createProposal transaction in the DAO
  async function createProposal() {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: NFTHodlerDAOAddress,
        abi: NFTHodlerDAOABI,
        functionName: "createProposal",
        args: [fakeNftTokenId],
      });

      await waitForTransactionMinedTx(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to fetch a proposal by its ID
  async function fetchProposalById(id) {
    try {
      const proposal = await readContract({
        address: NFTHodlerDAOAddress,
        abi: NFTHodlerDAOABI,
        functionName: "proposals",
        args: [id],
      });

      const [nftTokenId, proposer, deadline, okVotes, nokVotes, executed, canceled] = proposal;

      const parsedProposal = {
        proposalId: id,
        nftTokenId: nftTokenId.toString(),
        proposer: proposer.toString(),
        deadline: new Date(parseInt(deadline.toString()) * 1000),
        okVotes: okVotes.toString(),
        nokVotes: nokVotes.toString(),
        executed: Boolean(executed),
        canceled: Boolean(canceled),
      };

      return parsedProposal;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  async function fetchAllProposals() {
    try {
      const proposals = [];

      for (let i = 0; i < numOfProposalsInDao.data; i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }

      setProposals(proposals);
      return proposals;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  // Functions to vote OK or NOK on a proposal
  async function voteForProposal(proposalId, vote) {
    setLoading(true);
    try {
      const proposal = await fetchProposalById(proposalId);

      if (proposal.canceled) {
        window.alert("Proposal has been canceled");
      }

      const tx = await writeContract({
        address: NFTHodlerDAOAddress,
        abi: NFTHodlerDAOABI,
        functionName: "voteOnProposal",
        args: [proposalId, vote === "OK" ? 0 : 1],
      });

      await waitForTransaction(tx);
    } catch(error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to execute a proposal after deadline has been exceeded
  async function executeProposal(proposalId) {
    setLoading(true);
    try {
      const proposal = await fetchProposalById(proposalId);

      if (proposal.executed) {
        window.alert("Proposal has already been executed");
      }

      const tx = await writeContract({
        address: NFTHodlerDAOAddress,
        abi: NFTHodlerDAOABI,
        functionName: "executeProposal",
        args: [proposalId],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  }

  // Function to withdraw ether from the DAO contract
  async function withdrawDAOEther(amount) {
    setLoading(true);

    try {
      const tx = await writeContract({
        address: NFTHodlerDAOAddress,
        abi: NFTHodlerDAOABI,
        functionName: "withdrawEther",
        args: [],
      });

      await waitForTransaction(tx);
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
    setLoading(false);
  } 

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalanceOfUser.data === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }


  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.card}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "OK")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "NOK")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(OK)" : "(NOK)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  // Piece of code that runs everytime the value of `selectedTab` changes
  // Used to re-fetch all proposals in the DAO when user switches
  // to the 'View Proposals' tab
  useEffect(() => {
    if (selectedTab === "View proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div>
        <ConnectButton />
      </div>  
    );

    return (
      <div className={inter.className}>
        <Head>
          <title>DAOHodlerNFT DAO</title>
          <meta name="description" content="DaoHodlerNFT DAO" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Dao Hodlers!</h1>
            <div className={styles.description}>Welcome to the DAO!</div>
            <div className={styles.description}>
              Your DaoHodler NFT Balance: {nftBalanceOfUser.data}
              <br />
              {daoBalance.data && (
                <>
                  Treasury Balance:{" "}
                  {formatEther(daoBalance.data.value).toString()} ETH
                </>
              )}
              <br />
              Total Number of Proposals: {numOfProposalsInDao.data.toString()}
            </div>
            <div className={styles.flex}>
              <button
                className={styles.button}
                onClick={() => setSelectedTab("Create Proposal")}
              >
                Create Proposal
              </button>
              <button
                className={styles.button}
                onClick={() => setSelectedTab("View Proposals")}
              >
                View Proposals
              </button>
            </div>
            {renderTabs()}
            {/* Display additional withdraw button if connected wallet is owner */}
            {address && address.toLowerCase() === daoOwner.data.toLowerCase() ? (
              <div>
                {loading ? (
                  <button className={styles.button}>Loading...</button>
                ) : (
                  <button className={styles.button} onClick={withdrawDAOEther}>
                    Withdraw DAO ETH
                  </button>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
}
