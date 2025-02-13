import './../css/App.css';
import { ethers, Contract } from 'ethers';
import { React, useState, useEffect } from 'react';
import TokenArtifact from "../contracts/Token.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const localBlockchainAddress = 'http://localhost:8545';

function App() {
    const [vontingOn, setVotingOn] = useState(true);
    const [address, setAddress] = useState("");
    const [value, setValue] = useState(0);
    const [codinomeBalances, setCodinomeBalances] = useState({});
    
    useEffect(() => {
        getAllBalances();
        listeningVote();
    }, []);

    const setupContract = async () => {
        const provider = new ethers.JsonRpcProvider(localBlockchainAddress);
        const signer = await provider.getSigner();
        return new Contract(contractAddress, TokenArtifact.abi, signer);
    };
    
    const TuringsToSats = (turings) => ethers.parseUnits(turings.toString(), 18); 

    const SatsToTuring = (sats) => {
        const scalingFactor = ethers.parseUnits("1", 18);  // 1 Turing = 10^18 Sats
        return parseFloat(sats.toString()) / parseFloat(scalingFactor.toString());
    };    

    const getAllBalances = async () => {
        try {
            const contract = await setupContract();
            const [codi, bal] = await contract.getAllBalances();
            
            const balance_mp = codi.reduce((acc, codinome, index) => {
                acc[codinome] = SatsToTuring(bal[index]); // Convert to readable format
                return acc;
            }, {});
        
            setCodinomeBalances(balance_mp);
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    };

    // Mudar para buscar do contrato o novo saldo.
    const issueToken = async (codinome, turings) => {
        try {
            const contract = await setupContract();
            const sats = TuringsToSats(turings);
            await contract.issueToken(codinome, sats);
           
            setCodinomeBalances(prevAmounts => ({
                ...prevAmounts,
                [codinome]: (Number(prevAmounts[codinome]) || 0) + Number(turings),
            }));

        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    };

    
    const balanceByCodiname = async (address) => { 
        try {
            const contract = await setupContract();
            const balance = await contract.balanceByCodiname(address);
            console.log(balance);

        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    }

    const vote = async (codinome, turings) => {
        try {
            const contract = await setupContract();
            await contract.vote(codinome, TuringsToSats(turings));
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    }

    const votingOn = async () => {
        try {
            const contract = await setupContract();
            await contract.votingOn();
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    }

    const votingOff = async () => {
        try {
            const contract = await setupContract();
            await contract.votingOff();
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    }

    const listeningVote = async () => {
        try {
            const contract = await setupContract();

            contract.on('Voted', async (sender, recipient, sats) => {
                console.log(`Voted event: sender=${sender}, recipient=${recipient}, sats=${sats}`);
                const turings = SatsToTuring(sats); // Convert sats to turings
                const reward_in_sats = await contract.VOTE_REWARD(); 
                const reward_in_turing = SatsToTuring(reward_in_sats);

                // Get balances for sender and the provided address
                await contract.balanceByCodiname(sender);
                await contract.balanceByCodiname(recipient);
                
                setCodinomeBalances(prevAmounts => ({
                    ...prevAmounts,
                    [sender]: (prevAmounts[sender] || 0) + reward_in_turing,
                    [recipient]: (prevAmounts[recipient] || 0) + turings
                }));
            });

            // Cleanup the listener when the component is unmounted
            return () => {
                contract.removeListener('Voted');
            };
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    
    };


    const sortedEntries = () => Object.entries(codinomeBalances).sort((a, b) => b[1] - a[1]); 
    
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
                    <label htmlFor="address">Codiname</label>
                    <input 
                        type="text" 
                        id="address" 
                        placeholder="nomex" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="value">Value</label>
                    <input
                        type="number"
                        id="value"
                        placeholder="value in [0, 2]"
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
                {sortedEntries().map(([codinome, turings]) => (
                    <li key={codinome}>
                        <span>{codinome}</span>
                        <span>{turings.toFixed(3)}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    );
};

export default App;