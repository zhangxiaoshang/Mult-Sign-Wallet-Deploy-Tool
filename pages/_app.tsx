import React from "react";
import "../styles/globals.css";
import type { AppProps } from "next/app";

import {
  DAppProvider,
  Config,
  BSCTestnet,
  BSC,
  Mainnet,
  Goerli,
} from "@usedapp/core";
import { getDefaultProvider } from "ethers";

const config: Config = {
  readOnlyChainId: BSCTestnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider(
      process.env.NEXT_PUBLIC_ETH_MAINNET_RPC
    ),
    [Goerli.chainId]: getDefaultProvider(process.env.NEXT_PUBLIC_ETH_GORLI_RPC),

    [BSCTestnet.chainId]: getDefaultProvider(
      process.env.NEXT_PUBLIC_BSC_TESTNET_RPC
    ),
    [BSC.chainId]: getDefaultProvider(process.env.NEXT_PUBLIC_BSC_RPC),
  },
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DAppProvider config={config}>
      <Component {...pageProps} />
    </DAppProvider>
  );
}
