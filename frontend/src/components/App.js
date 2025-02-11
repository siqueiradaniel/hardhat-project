import './../css/App.css';
import { ethers, Contract, ConstructorFragment } from 'ethers';
import { React, useRef, useState, useEffect } from 'react';
import TokenArtifact from "../contracts/Token.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const signerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const localBlockchainAddress = 'http://localhost:8545';

function App() {
    const [vontingOn, setVotingOn] = useState(true);
    const [address, setAddress] = useState("");
    const [value, setValue] = useState(0);
    const [codinomeAmounts, setCodinomeAmounts] = useState({});

    useEffect(() => {
        listeningVote();
    }, []);

    const setupContract = async () => {
        const provider = new ethers.JsonRpcProvider(localBlockchainAddress);
        const signer = await provider.getSigner();
        return new Contract(contractAddress, TokenArtifact.abi, signer);
    };
    
    const getSymbol = async () => {
        const contract = await setupContract();

        contract.symbol().then((res) => {
            console.log(res);
        });
    }

    const issueToken = async (codinome, sats) => {
        const contract = await setupContract();
        
        contract.issueToken(codinome, sats)
    }
    
    const balanceByCodiname = async (address) => { 
        const contract = await setupContract();
        
        // get the from
        contract.balanceByCodiname(address).then((res) => {
            console.log(res);
        });
    }

    const vote = async (codinome, sats) => {
        const contract = await setupContract();
        
        // get the from
        contract.vote(codinome, sats).then((res) => {
            contract.balanceOf(signerAddress).then((res) => {
                console.log(res);
            });
        });
    }

    const votingOn = async () => {
        const contract = await setupContract();
        
        // get the from
        contract.votingOn().then((res) => {
            console.log(res);
        });
    }

    const votingOff = async () => {
        const contract = await setupContract();
        
        // get the from
        contract.votingOff().then((res) => {
            console.log(res);
        });
    }

    const msgSender = async () => {
        const contract = await setupContract();

        contract.msgSender().then((res) => {
            console.log(res);
        });
    }

    
    
    
    const listeningVote = async () => {
        const contract = await setupContract();

        contract.on('Voted', (voter, codinome, amount) => {
            console.log(`Voted event: voter=${voter}, codinome=${codinome}, amount=${amount}`);

            // Convert amount to a number (assuming it's a string)
            amount = parseInt(amount, 10);

            setCodinomeAmounts(prevAmounts => {
                // If codinome already exists, add amount to the previous value
                const newAmounts = { ...prevAmounts };
                newAmounts[codinome] = newAmounts[codinome] ? newAmounts[codinome] + amount : amount;
                return newAmounts;
            });
        });

        // Cleanup the listener when the component is unmounted
        return () => {
            contract.removeListener('Voted');
        };
    };
    

    //issueToken("nome3", 1000);
    //balanceOf('0x90F79bf6EB2c4f870365E785982E1f101E93b906');
    //votingOff()
    //votingOn()
    // msgSender()
    // vote("nome1", 1000);
    const sortedEntries = Object.entries(codinomeAmounts).sort((a, b) => b[1] - a[1]);

    return (
        <div className="dashboard-container">
        
        {/* Left: Voting Section */}
        <div className="vote-section">
            <div className="vote-header">
                <p className="vote-title">Vote Active</p>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={vontingOn}
                        onChange={() => {
                            (vontingOn ? votingOff : votingOn)();
                            setVotingOn(!vontingOn);
                        }}
                    />
                    <span className="slider" />
                </label>
            </div>

            <div className="vote-box">
                <div className="input-group">
                    <label htmlFor="address">Address</label>
                    <input 
                        type="text" 
                        id="address" 
                        placeholder="Value" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="value">Value (Entre 0 e 2)</label>
                    <input
                        type="number"
                        id="value"
                        placeholder="Limitar quantidade de dígitos****"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                <button className="btn-primary" onClick={() => vote(address, value)}>Votar</button>
            </div>

            <div className='btn-group'>
                <button className="btn-secondary" onClick={() => issueToken(address, value)}>Emitir Tokens</button>
                <button className="btn-secondary" onClick={() => balanceByCodiname(address)}>Ver saldo</button>
            </div>
        </div>

        {/* Right: Ranking Section */}
        <div className="ranking-section">
            <h2>Ranking</h2>
            <ul className="ranking-list">
                {sortedEntries.map(([codinome, amount]) => (
                    <li key={codinome}>
                        <span>{codinome}</span>
                        <span>{amount}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    );
};

export default App;