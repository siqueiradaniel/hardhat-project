import './../css/App.css';
import { parseUnits, ethers, Contract } from 'ethers';
import { React, useState, useEffect } from 'react';
import TokenArtifact from "../contracts/Token.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const signerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const localBlockchainAddress = 'http://localhost:8545';

function App() {
    const [vontingOn, setVotingOn] = useState(true);
    const [address, setAddress] = useState("");
    const [value, setValue] = useState(0);
    const [codinomeBalances, setCodinomeBalances] = useState({});
    

    useEffect(() => {
        listeningVote();
        getAllBalances();
    }, []);

    const setupContract = async () => {
        const provider = new ethers.JsonRpcProvider(localBlockchainAddress);
        const signer = await provider.getSigner();
        return new Contract(contractAddress, TokenArtifact.abi, signer);
    };
    
    const TuringsToSats = (turings) => parseUnits(turings.toString(), 18); 
    const SatsToTuring = (sats: BigNumber): number => {
        // Assuming 1 Turing = 10^18 Sats (example scaling factor)
        const scalingFactor = ethers.parseUnits("1", 18); 
        return parseFloat(sats.toString()) / parseFloat(scalingFactor.toString());
    };    


    const getSymbol = async () => {
        try {
            const contract = await setupContract();
            await contract.symbol().then((res) => {
                console.log(res);
            });
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    }

    const getAllBalances = async () => {
        try {
            const contract = await setupContract();
            const [codi, bal] = await contract.getAllBalances();
            
            const balance_mp = codi.reduce((acc, codinome, index) => {
                acc[codinome] = SatsToTuring(bal[index]); // Convert to readable format
                return acc;
            }, {});
        
            setCodinomeBalances(balance_mp);
            console.log(codinomeBalances);
        } catch (error) {
            alert(error.reason ?? error.revert?.args?.[0] ?? "Unknown error");
        }
    };


    
    const balanceByCodiname = async (codinome) => { 
        try {
            const contract = await setupContract();
            const address = await contract.addresses(codinome); // Get the address linked to the codinome
    
            if (address === "0x0000000000000000000000000000000000000000") {
                throw new Error("Invalid codinome");
            }
    
            const balance = await contract.balanceOf(address); // Get balance of the address
            return balance;
        } catch (error) {
            alert(error.reason ?? error.message ?? "Unknown error");
        }
    };
    
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
        const contract = await setupContract();
    
        contract.on('Voted', (voter, codinome, sats) => {
            console.log(`Voted event: voter=${voter}, codinome=${codinome}, sats=${sats}`);
    
            // Ensure sats is converted to Turings with correct precision
            const turings = SatsToTuring(sats);  // Get the correct value in Turings

            setCodinomeBalances(prevAmounts => {
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
                {sortedEntries().map(([codinome, turings]) => (
                    <li key={codinome}>
                        <span>{codinome}</span>
                        <span>{turings}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    );
};

export default App;