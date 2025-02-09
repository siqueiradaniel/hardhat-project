import './../css/App.css';
import { ethers, Contract, ConstructorFragment } from 'ethers';
import { useState, useEffect } from 'react';
import TokenArtifact from "../contracts/Token.json";

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const signerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const localBlockchainAddress = 'http://localhost:8545';

function App() {
    const setupContract = async () => {
        const provider = new ethers.JsonRpcProvider(localBlockchainAddress);
        const signer = await provider.getSigner();
        return new Contract(tokenAddress, TokenArtifact.abi, signer);
    };
    
    const getSymbol = async () => {
        const contract = await setupContract();

        contract.symbol().then((res) => {
            console.log(res);
        });
    }

    const makeTransfer = async (_to, sats) => {
        const contract = await setupContract();
        
        // get the from
        contract.transfer(_to, sats).then((res) => {
            contract.balanceOf(signerAddress).then((res) => {
                console.log(res);
            });
            contract.balanceOf(_to).then((res) => {
                console.log(res);
            });
        });
    }
    makeTransfer(recipientAddress, 100);
    getSymbol();


    // Create a contract connected to the signer
   
    return (
        <h1>Hello</h1>
    );
}

export default App;