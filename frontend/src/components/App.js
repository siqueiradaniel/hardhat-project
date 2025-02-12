import './../css/App.css';
import { toBigInt, parseUnits, ethers, Contract, ConstructorFragment } from 'ethers';
import { React, useRef, formatUnits, useState, useEffect } from 'react';
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
    
    const TuringsToSats = (turings) => parseUnits(turings.toString(), 18); 
    const SatsToTuring = (sats) => parseFloat(formatUnits(sats, 18)); // convert sats to turings with proper decimal handling


    const getSymbol = async () => {
        const contract = await setupContract();

        await contract.symbol().then((res) => {
            console.log(res);
        });
    }

    const issueToken = async (codinome, turings) => {
        const contract = await setupContract();
        
        await contract.issueToken(codinome, TuringsToSats(turings))
    }
    
    const balanceByCodiname = async (address) => { 
        const contract = await setupContract();
        
        await contract.balanceByCodiname(address).then((res) => {
            console.log(SatsToTuring(res));
        });
    }

    const vote = async (codinome, Turings) => {
        const contract = await setupContract();
        
        await contract.vote(codinome, TuringsToSats(Turings));
    }

    const votingOn = async () => {
        const contract = await setupContract();
        
        await contract.votingOn();
    }

    const votingOff = async () => {
        const contract = await setupContract();
        
        await contract.votingOff();
    }

    const msgSender = async () => {
        const contract = await setupContract();

        await contract.msgSender().then((res) => {
            console.log(res);
        });
    }

    
    const listeningVote = async () => {
        const contract = await setupContract();
    
        await contract.on('Voted', (voter, codinome, sats) => {
            console.log(`Voted event: voter=${voter}, codinome=${codinome}, sats=${sats}`);
    
            // Ensure sats is converted to Turings with correct precision
            const turings = SatsToTuring(sats);  // Get the correct value in Turings
    
            setCodinomeAmounts(prevAmounts => {
                const newAmounts = { ...prevAmounts };
                newAmounts[codinome] = newAmounts[codinome] ? newAmounts[codinome] + turings : turings;
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
                {sortedEntries.map(([codinome, turings]) => (
                    <li key={codinome}>
                        <span>{codinome}</span>
                        <span>{turings.toFixed(1)}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    );
};

export default App;