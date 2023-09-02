import "@rainbow-me/rainbowkit/styles.css";
import '@/styles/globals.css'
require("dotenv").config();
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from '@wagmi/core/providers/alchemy'


const { chains, publicClient } = configureChains([sepolia],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }), publicProvider()],);

const { connectors } = getDefaultWallets({
  appName: "DaoHodlerNFT DAO",
  projectId: "44d227d08b9d51abebefa34f16cc08f7",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
