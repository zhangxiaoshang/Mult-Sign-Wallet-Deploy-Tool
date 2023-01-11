import { useState } from "react";
import Head from "next/head";
import { utils, ContractFactory, providers, ethers } from "ethers";
import {
  useEthers,
  useEtherBalance,
  useConfig,
  useChainMeta,
} from "@usedapp/core";
import { MetamaskConnect } from "../components/MetamaskConnect";

import ForwarderArt from "../abis/Forwarder.json";
import WalletSimpleArt from "../abis/WalletSimple.json";
const WalletSimpleABI = WalletSimpleArt.abi;
const WalletSimpleBytecode = WalletSimpleArt.bytecode;

import styles from "./index.module.scss";

export default function Home() {
  const config = useConfig();
  const { account, deactivate, chainId, library } = useEthers();
  const etherBalance = useEtherBalance(account);
  const chainMeta = useChainMeta(chainId || 1);

  const [addressList, setAddressList] = useState<string[]>(["", "", ""]);
  const [contractAddr, setContractAddr] = useState("");
  const [deploying, setDeploying] = useState(false);

  const getSupportChain = () => {
    const readOnlyUrls = config.readOnlyUrls;
    if (!readOnlyUrls) return "";

    const chains = Object.values(readOnlyUrls);
    const chainNames = chains.map((c) => {
      if (!(typeof c === "string") && "_network" in c) {
        return c._network.name === "homestead" ? "ethereum" : c._network.name;
      } else {
        return null;
      }
    });

    return chainNames.join(" or ");
  };

  const handlelDeploy = async () => {
    if (!(library instanceof providers.JsonRpcProvider)) {
      return console.log("invalid library:", library);
    }

    try {
      setDeploying(true);

      const signer = library?.getSigner(account);

      const myContract = new ContractFactory(
        WalletSimpleABI,
        WalletSimpleBytecode,
        signer
      );

      console.log("addressList:", addressList);

      const contract = await myContract.deploy(addressList);

      console.log("contract:", contract);
      await contract.deployed();

      setContractAddr(contract.address);

      console.log(contract.address);
      console.log(contract.deployTransaction);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setDeploying(false);
    }
  };

  if (!chainId || !config.readOnlyUrls?.[chainId]) {
    return (
      <p className={styles.networkError}>
        Please use either {getSupportChain()} network.
      </p>
    );
  }

  return (
    <div className={styles.content}>
      <Head>
        <title>Mult-Sign-Wallet Contract Deploy Tool</title>
      </Head>

      <h1>Mult-Sign-Wallet Contract Deploy Tool</h1>

      <div className={styles.wrapAccount}>
        <MetamaskConnect />
        {etherBalance && (
          <>
            <div className={styles.balance}>
              ChainName: <span className="bold">{chainMeta.chainName}</span>
            </div>
            <div className={styles.balance}>
              Balance:{" "}
              <span className="bold">
                {utils.formatEther(etherBalance)}{" "}
                {chainMeta.nativeCurrency?.symbol}
              </span>
            </div>
          </>
        )}

        {account && <button onClick={() => deactivate()}>Disconnect</button>}
      </div>

      {/* input form */}
      <div className={styles.wrapForm}>
        {addressList.map((addr, index) => (
          <div key={index} className={styles.wrapAccountInput}>
            <span>Account {index + 1}</span>
            <input
              type="text"
              value={addr}
              onChange={(e) => {
                const newList = [...addressList];
                newList[index] = e.target.value;

                setAddressList(newList);
              }}
            />
          </div>
        ))}

        {deploying ? (
          <button disabled className={styles.deployBtn}>
            Deploying...
          </button>
        ) : (
          <button className={styles.deployBtn} onClick={handlelDeploy}>
            Deploy Contract
          </button>
        )}
      </div>

      {/* deployed */}
      {
        <div className={styles.wrapContract}>
          InitCodeHash:
          <p>{ethers.utils.keccak256(ForwarderArt.bytecode)}</p>
          <br />
          <p>
            Contract Address:{" "}
            {contractAddr ? (
              <a
                href={chainMeta.getExplorerAddressLink(contractAddr)}
                target="_blank"
                rel="noreferrer"
              >
                {contractAddr}
              </a>
            ) : (
              "wait deploy"
            )}
          </p>
        </div>
      }
    </div>
  );
}
