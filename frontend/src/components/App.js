import './../css/App.css';
import { ethers } from 'ethers';
import { React, useState, useEffect, useRef } from 'react';
import TokenArtifact from "../contracts/Token.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const localBlockchainAddress = 'http://localhost:8545';

function App() {
    const [vontingOn, setVotingOn] = useState(true);
    const [address, setAddress] = useState("");
    const [value, setValue] = useState(0);
    const [codinomeBalances, setCodinomeBalances] = useState({});
    const [signerCodinome, setSignerCodinome] = useState("Conecte-se a uma conta autorizada!");
    
    useEffect(() => {
        getAllBalances();
        listeningVote();
    }, []);

    const setupContract = async () => {
        
        try {
            if (window.ethereum == null) {
                throw new Error("Usuário não autorizado!");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const _signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, TokenArtifact.abi, _signer);
            setSignerCodinome(await contract.getSenderCodinome());
            return contract;
        } catch (error) {
            throw new Error(error.reason || error.revert?.args?.[0] || "Usuário não autorizado!");
        }                   
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
            alert(error.reason || error.message || "Erro em getAllBalances!");
        }
    };

    // Mudar para buscar do contrato o novo saldo.
    const issueToken = async (codinome, turings) => {
        try {
            const contract = await setupContract();
            const sats = TuringsToSats(turings);
            await contract.issueToken(codinome, sats);
            const newBalance = await contract.balanceByCodiname(codinome);
            console.log("Previous balance:", codinomeBalances[codinome]);
            console.log("New balance:", SatsToTuring(newBalance));


            setCodinomeBalances(prevAmounts => ({
                ...prevAmounts,
                [codinome]: codinomeBalances[codinome] + turings,
            }));

        } catch (error) {
            alert(error.reason || error.message || "Erro em votingOff!");
        }
    };

    const balanceByCodiname = async (codinome) => { 
        try {
            const contract = await setupContract();
            const balance = await contract.balanceByCodiname(codinome);
            alert(`${codinome} tem ${SatsToTuring(balance)} Turings`);

        } catch (error) {
            alert(error.reason || error.message || "Erro em votingOff!");
        }
    };
    
    const vote = async (codinome, turings) => {
        try {
            const contract = await setupContract();
            await contract.vote(codinome, TuringsToSats(turings));
        } catch (error) {
            alert(error.reason || error.message || "Erro em votingOff!");
        }
    }

    const votingOn = async () => {
        try {
            const contract = await setupContract();
            await contract.votingOn();
            setVotingOn(true);
        } catch (error) {
            alert(error.reason || error.message || "Erro em votingOff!");
        }
    }

    const votingOff = async () => {
        try {
            console.log(1);
            const contract = await setupContract();
            console.log(contract);
            await contract.votingOff();
            console.log(3);
            setVotingOn(false);
            console.log(4);
        } catch (error) {
            alert(error.reason || error.message || "Erro em votingOff!");
        }
    }

    const listeningVote = async () => {
        try {
            const contract = await setupContract();

            contract.on('Voted', async (sender, recipient, sats) => {
                console.log(`Voted event: sender=${sender}, recipient=${recipient}, sats=${sats}`);

                // Get balances for sender and the provided address
                const senderBalance = await contract.balanceByCodiname(sender);
                const recipientBalance = await contract.balanceByCodiname(recipient);

                // Convert to saTurings
                const convertedSenderBalance = SatsToTuring(senderBalance); 
                const convertedRecipientBalance = SatsToTuring(recipientBalance);
                
                setCodinomeBalances(prevAmounts => ({
                    ...prevAmounts,
                    [sender]: convertedSenderBalance,
                    [recipient]: convertedRecipientBalance
                }));
            });

            // Cleanup the listener when the component is unmounted
            return () => {
                contract.removeListener('Voted');
            };
        } catch (error) {
            alert(error.reason || error.message || "Erro em votingOff!");
        }
    
    };


    const sortedEntries = () => Object.entries(codinomeBalances).sort((a, b) => b[1] - a[1]); 
    
    return (
        <div className="dashboard-container">
        
        {/* Left: Voting Section */}
        <div className="vote-section">
            <div className="vote-header">
                <div className="vote-header">
                    <p><strong>Codinome:</strong> {signerCodinome}</p>
                </div>
                <div className="vote-header">
                    <p className="vote-title">Vote Active</p>
                    
                    <label className="toggle-switch">
                        <input 
                            type="checkbox" 
                            checked={vontingOn}
                            onChange={() => {
                                (vontingOn ? votingOff : votingOn)();
                            }}
                        />
                        <span className="slider" />
                    </label>
                </div>
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
                        <span>{Math.trunc(turings * 1000) / 1000}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    );
};

export default App;