import './../css/App.css';
import { ethers, Contract, ConstructorFragment } from 'ethers';
import { React, useRef, useState, useEffect } from 'react';
import TokenArtifact from "../contracts/Token.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const signerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const localBlockchainAddress = 'http://localhost:8545';

function App() {
    const [vontingOn, setVotingOn] = useState(true);
    const [address, setAddress] = useState("");
    const [value, setValue] = useState(0);
    const firstRun = useRef(false);

    useEffect(() => {
        if (!firstRun.current) {
            listeningVote();
            firstRun.current = true;
        }
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
        const contract = await setupContract(); // Instância do contrato
    
        console.log("Get in")
        // Add a new listener for the "Voted" event
        contract.on('Voted', (voter, codinome, amount) => {
            console.log(`Voted event: voter=${voter}, codinome=${codinome}, amount=${amount}`);
        });
    };
    
    

    

    //issueToken("nome3", 1000);
    //balanceOf('0x90F79bf6EB2c4f870365E785982E1f101E93b906');
    //votingOff()
    //votingOn()
    // msgSender()
    // vote("nome1", 1000);
    

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
                    <li>
                        <span>Joãozinho</span>
                        <span>42.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                    <li>
                        <span>Joãozinho</span>
                        <span>42.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                    <li>
                        <span>Joãozinho</span>
                        <span>42.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                    <li>
                        <span>Joãozinho</span>
                        <span>42.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                    <li>
                        <span>Joãozinho</span>
                        <span>42.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                    <li>
                        <span>Joãozinho</span>
                        <span>42.3</span>
                    </li>
                    <li>
                        <span>Mariazinha</span>
                        <span>31.8</span>
                    </li>
                    <li>
                        <span>Flora</span>
                        <span>12.3</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default App;