import { useState } from "react";
import { utils, ContractFactory, providers, ethers } from "ethers";
import {
  useEthers,
  useEtherBalance,
  useConfig,
  useChainMeta,
} from "@usedapp/core";
import { MetamaskConnect } from "../components/MetamaskConnect";

import WalletSimpleArt from "../abis/WalletSimple.json";

import styles from "./index.module.scss";

export default function Home() {
  const config = useConfig();
  const { account, deactivate, chainId, library } = useEthers();
  const etherBalance = useEtherBalance(account);
  const chainMeta = useChainMeta(chainId || 1);

  const [addressList, setAddressList] = useState<string[]>(["", "", ""]);
  const [contractAddr, setContractAddr] = useState("");
  const [deploying, setDeploying] = useState(false);

  const handlelDeploy = async () => {
    if (!(library instanceof providers.JsonRpcProvider)) {
      return console.log("invalid library:", library);
    }

    try {
      setDeploying(true);

      const signer = library?.getSigner(account);

      const myContract = new ContractFactory(
        WalletSimpleArt.abi,
        WalletSimpleArt.bytecode,
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
        Please use either BSC Mainnet or BSC testnet.
      </p>
    );
  }

  return (
    <div className={styles.content}>
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
      {!!contractAddr && (
        <div className={styles.wrapContract}>
          Contract Address:
          <p>
            <a
              href={chainMeta.getExplorerAddressLink(contractAddr)}
              target="_blank"
              rel="noreferrer"
            >
              {contractAddr}
            </a>
          </p>
          <br />
          InitCodeHash:
          <p>{ethers.utils.keccak256(WalletSimpleArt.bytecode)}</p>
        </div>
      )}
    </div>
  );
}
