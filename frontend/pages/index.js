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
  const DaoOwner = useContractRead({
    abi: NFTHodlerDAOABI,
    address: NFTHodlerDAOAddress,
    functionName: "owner",
  });

  // Fetch the balance of the DAO
  const DaoBalance = useBalance({
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

}
