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

  
}
