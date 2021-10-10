import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// This file is generated after the contract compilation
import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json';

const Index = () => {
  const [greeting, setGreetingValue] = useState('');
  const [blockchainGreeting, setBlockchainGreeting] = useState('');
  const [blockchainData, setBlockchainData] = useState({
    blockNumber: undefined,
  });

  const [signers, setSigners] = useState(new Map());

  useEffect(() => {
    getGreeting();
    getBlockchainData();
  }, []);

  useEffect(() => console.log(signers), [signers]);

  const mapToArray = Array.from(signers, ([address, balance]) => ({
    address,
    balance,
  }));

  // request access to the user's Metamask account
  const requestAccount = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  // do some query to the blockcahin to obtain current state, fetch historic logs and so on
  const getBlockchainData = async () => {
    if (window.ethereum) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const blockNumber = await provider.getBlockNumber();

      setBlockchainData({ blockNumber });
    }
  };

  // call the smart contract and read the current greeting value
  const getGreeting = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        Greeter.abi,
        provider
      );

      const data = await contract.greet();
      setBlockchainGreeting(data);
    }
  };

  // call the smart contract and set the greeting value
  const setGreeting = async () => {
    if (window.ethereum) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        Greeter.abi,
        signer
      );

      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();

      // Get the information of the signer
      const address = await signer.getAddress();
      const { _hex } = await signer.getBalance();
      const balance = parseFloat(ethers.utils.formatEther(_hex));
      setSigners((prev) => new Map(prev.set(address, balance)));

      getGreeting();
      getBlockchainData();
    }
  };

  /**
   * TODO
   *  1) Investigate about events on Solidity
   */
  const getHistoric = () => {};

  return (
    <>
      <Head>
        <title>slinger.eth</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-5 md:p-20">
        <h1 className="text-4xl">slinger.eth</h1>

        <h2 className="text-xl mt-5">
          Contract Address: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
        </h2>

        <div className="mt-10">
          <div>
            <h3 className="text-lg font-bold underline">Blockchain data</h3>
          </div>

          <div>
            <p>Block Number: {blockchainData.blockNumber || 'undefined'}</p>
          </div>

          <button
            className="mt-2 px-2 py border border-black rounded-md"
            onClick={getBlockchainData}
          >
            Fetch Blockchain Data
          </button>
        </div>

        <div>
          <h2 className="text-xl mt-5">
            Current Greeting:
            <span className="font-extrabold">{` ${blockchainGreeting}`}</span>
          </h2>
          <button
            className="mt-2 px-2 py border border-black rounded-md"
            onClick={getGreeting}
          >
            Fetch Greeting
          </button>
        </div>

        <br />
        <hr className="border-black" />
        <br />

        <div className="flex">
          <div className=" mr-2">
            <input
              className="border border-black rounded px-2"
              placeholder="Set a new Greeting"
              onChange={({ target: { value } }) => setGreetingValue(value)}
            />
          </div>

          <div>
            <button
              className="px-2 py border border-black rounded-md"
              onClick={setGreeting}
            >
              Set Greeting
            </button>
          </div>
        </div>

        <br />
        <hr className="border-black" />
        <br />

        <div>
          <h3 className="text-lg font-bold underline">Signers</h3>

          <div>
            {mapToArray.map((signers) => (
              <>
                <h2 className="text-xl mt-5">Address: {signers.address}</h2>
                <p className="">Balance: {signers.balance}</p>
              </>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Index;
