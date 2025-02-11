//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "Turing";
    string public symbol = "TUR";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 0; // Include decimals (18 decimals as common in ERC-20)

    // An address type variable is used to store ethereum accounts.
    address public owner;
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;
    mapping(string => address) addresses;
    mapping(address => mapping(string => bool)) public voted; // Track voting

    // Voting state
    bool public votingActive = true;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Voted(address indexed voter, string codinome, uint256 amount);

    /**
     * Contract initialization.
     */
    constructor() {
        owner = msg.sender;
    
        // Sample mappings for addresses (e.g., "nome1", "nome2" etc.)
        addresses["nome0"] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        addresses["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        addresses["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        addresses["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        addresses["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        addresses["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        addresses["nome6"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        addresses["nome7"] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        addresses["nome8"] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        addresses["nome9"] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        addresses["nome10"] = 0xBcd4042DE499D14e55001CcbB24a551F3b954096;
    }

    modifier isSuperUser() {
        require(msg.sender == owner || msg.sender == professora, "Permissao negada, apenas owner ou a professora!");
        _;
    }

    modifier unauthorizedSender() {
        require(msg.sender != address(0), "Remetente nao autorizado");
        _;
    }
    modifier unauthorizedRecipient(address userAddress) {
        require(userAddress != address(0), "Destinatario nao autorizado");
        _;
    }
    modifier cantVoteForYourself(string memory codinome) {
        require(msg.sender != addresses[codinome], "Nao pode votar em si mesmo");
        _;
    }
    modifier hasTheValue(address userAddress, uint256 amount) {
        require(balances[userAddress] >= amount, "Not enough tokens");
        _;
    }
    modifier voteActivated() {
        require(votingActive, "Voting is not active");
        _;
    }
    modifier oneVoteToRecipient(string memory codinome) {
        require(!voted[msg.sender][codinome], "Voce ja votou nesse usuario");
        _;
    }
    modifier onlyTwoSats(uint256 sats) {
        require(sats <= 2, "Quantidade de tokens de voto muito alta");
        _;
    }
    
    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address userAddress, uint256 amount) external hasTheValue(userAddress, amount) {
        balances[msg.sender] -= amount;
        balances[userAddress] += amount;

        emit Transfer(msg.sender, userAddress, amount);
    }

    function msgSender() external view returns (address) {
        return msg.sender;
    }     

    /**
     * Read only function to retrieve the token balance of a given account.
     */
    function balanceOf(address userAddress) unauthorizedRecipient(userAddress) external view returns (uint256) {
        return balances[userAddress];  
    }

    function balanceByCodiname(string memory codinome) unauthorizedRecipient(addresses[codinome]) external view returns (uint256) {
        return balances[addresses[codinome]];
    }

    /**
     * This function allows the owner or the professor to issue new tokens.
     * This function mints tokens and assigns them to the specified address.
     */
    function issueToken(string memory codinome, uint256 sats) public isSuperUser() unauthorizedRecipient(addresses[codinome]) {
        _mint(addresses[codinome], sats);
    }

    /**
     * This function allows authorized users to vote for a codinome.
     * Users can only vote once and cannot vote for themselves. 
     * The maximum amount of tokens a user can vote with is 2 * 10^18 saTurings.
     * It also rewards the voter with 0.2 Turing tokens.
     */
    function vote(string memory codinome, uint256 sats) public unauthorizedSender() 
                                                               unauthorizedRecipient(addresses[codinome])
                                                               cantVoteForYourself(codinome)
                                                               voteActivated()
                                                               oneVoteToRecipient(codinome)
                                                               onlyTwoSats(sats) {
        _mint(addresses[codinome], sats * 10**18 );
        _mint(msg.sender, 0.2 * 10**18); // Reward for voting

        voted[msg.sender][codinome] = true; // Mark that the user has voted

        emit Voted(msg.sender, codinome, sats);
    }

    /**
     * This method enables voting. Can be called only by the owner or the professor.
     */
    function votingOn() public isSuperUser() {
        votingActive = true;
    }

    /**
     * This method disables voting. Can be called only by the owner or the professor.
     */
    function votingOff() public isSuperUser() {
        votingActive = false;
    }

    // Internal function to mint new tokens
    function _mint(address userAddress, uint256 amount) internal unauthorizedRecipient(userAddress) {
        balances[userAddress] += amount;
        totalSupply += amount;
    }
}
