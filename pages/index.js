import Head from 'next/head';
import { useState } from 'react';
import { ethers } from 'ethers';
import Greeter from '../artifacts/contracts/Greeter.sol/Greeter.json';

const Index = () => {
  const [greeting, setGreetingValue] = useState('');
  const [blockchainGreeting, setBlockchainGreeting] = useState('');

  // request access to the user's Metamask account
  const requestAccount = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
  };

  // call the smart contract and read the current greeting value
  const fetchGreeting = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        Greeter.abi,
        provider
      );

      try {
        const data = await contract.greet();
        setBlockchainGreeting(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // call the smart contract and set the greeting value
  const setGreeting = async () => {
    if (window.ethereum) {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log('Signer:', signer);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        Greeter.abi,
        signer
      );
      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      fetchGreeting();
    }
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>slinger.eth</h1>

        <h3>Address: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</h3>

        <div>
          <h1>Current Greeting: {blockchainGreeting}</h1>
          <button onClick={fetchGreeting}>Fetch Greeting</button>
        </div>

        <br />

        <div>
          <input
            placeholder="Set a new Greeting"
            onChange={({ target: { value } }) => setGreetingValue(value)}
          />
          <button onClick={setGreeting}>Set Greeting</button>
        </div>
      </main>
    </>
  );
};

export default Index;
