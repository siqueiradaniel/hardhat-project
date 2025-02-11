//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "Turing";
    string public symbol = "MHT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000 * 10**18; // Include decimals (18 decimals as common in ERC-20)

    // An address type variable is used to store ethereum accounts.
    address public owner;
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    string public winner = "nobody";
    uint256 public winnerValue = 0;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;
    mapping(string => address) addresses;
    mapping(address => mapping(string => bool)) public voted; // Track voting

    // Voting state
    bool public votingActive = true;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Voted(address indexed voter, string indexed codinome, uint256 amount);

    /**
     * Contract initialization.
     */
    constructor() {
        owner = msg.sender;
    
        // Sample mappings for addresses (e.g., "nome1", "nome2" etc.)
        addresses["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        addresses["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        addresses["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        // Add other addresses as needed
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }

    function msgSender() external view returns (address) {
        return msg.sender;
    }     

    /**
     * Read only function to retrieve the token balance of a given account.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];  
    }

    function balanceByCodiname(string memory codinome) external view returns (uint256) {
        return balances[addresses[codinome]];
    }

    /**
     * This function allows the owner or the professor to issue new tokens.
     * This function mints tokens and assigns them to the specified address.
     */
    function issueToken(string memory codinome, uint256 sats) public {
        require(msg.sender == owner || msg.sender == professora, "Permissao negada, apenas owner ou a professora!");
        _mint(addresses[codinome], sats);
    }

    /**
     * This function allows authorized users to vote for a codinome.
     * Users can only vote once and cannot vote for themselves. 
     * The maximum amount of tokens a user can vote with is 2 * 10^18 saTurings.
     * It also rewards the voter with 0.2 Turing tokens.
     */
    function vote(string memory codinome, uint256 sats) public {
        require(votingActive, "Voting is not active");
        require(addresses[codinome] != address(0), "Usuario nao existe");
        require(msg.sender != address(0), "Usuario nao autorizado");
        require(msg.sender != addresses[codinome], "Nao pode votar em si mesmo");
        require(!voted[msg.sender][codinome], "Voce ja votou nesse usuario");
        require(sats <= 2, "Quantidade de tokens de voto muito alta");

        _mint(addresses[codinome], sats * 10**18 );
        _mint(msg.sender, 0.2 * 10**18); // Reward for voting

        voted[msg.sender][codinome] = true; // Mark that the user has voted

        emit Voted(msg.sender, codinome, sats);
    }

    /**
     * This method enables voting. Can be called only by the owner or the professor.
     */
    function votingOn() public {
        require(msg.sender == owner || msg.sender == professora, "Permissao negada, apenas owner ou a professora!");
        votingActive = true;
    }

    /**
     * This method disables voting. Can be called only by the owner or the professor.
     */
    function votingOff() public {
        require(msg.sender == owner || msg.sender == professora, "Permissao negada, apenas owner ou a professora!");
        votingActive = false;
    }

    // Internal function to mint new tokens
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "Mint to the zero address");
        balances[to] += amount;
        totalSupply += amount;
    }
}
