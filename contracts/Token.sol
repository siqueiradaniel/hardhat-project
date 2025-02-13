//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    // Criei essas constantes, mas colocar direto no código é feio demais.
    uint256 public constant ACCOUNT_NUMBER = 11;
    uint256 public constant VOTE_REWARD = 0.2 * 10**18;
    uint256 public constant MAX_MINT_VOTE = 2 * 10**18;

    address public owner;
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    bool public votingActive = true;

    mapping(string => address) addresses;
    mapping(address => mapping(string => bool)) public voted; // Track voting

    string[] codinomes = new string[](ACCOUNT_NUMBER);
    
    event Voted(address indexed voter, string codinome, uint256 amount);

    constructor() ERC20("Turing", "TUR") {
        owner = msg.sender;
    
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

        codinomes[0] = "nome0";
        codinomes[1] = "nome1";
        codinomes[2] = "nome2";
        codinomes[3] = "nome3";
        codinomes[4] = "nome4";
        codinomes[5] = "nome5";
        codinomes[6] = "nome6";
        codinomes[7] = "nome7";
        codinomes[8] = "nome8";
        codinomes[9] = "nome9";
        codinomes[10] = "nome10";
    }

    modifier isSuperUser() {
        require(msg.sender == owner || msg.sender == professora, "Permissao negada, apenas owner ou a professora!");
        _;
    }

    modifier unauthorizedSender() {
        require(msg.sender != address(0), "Remetente nao autorizado!");
        _;
    }
    modifier unauthorizedRecipient(address userAddress) {
        require(userAddress != address(0), "Destinatario nao autorizado!");
        _;
    }
    modifier cantVoteForYourself(string memory codinome) {
        require(msg.sender != addresses[codinome], "Nao pode votar em si mesmo!");
        _;
    }
    modifier voteActivated() {
        require(votingActive, "Votacao esta desativada!");
        _;
    }
    modifier oneVoteToRecipient(string memory codinome) {
        require(!voted[msg.sender][codinome], "Voce ja votou nesse usuario!");
        _;
    }
    modifier onlyTwoSats(uint256 sats) {
        require(sats <= MAX_MINT_VOTE, "Quantidade de tokens de voto muito alta!");
        _;
    }

    function balanceByCodiname(string memory codinome) unauthorizedRecipient(addresses[codinome]) external view returns (uint256) {
        return balanceOf(addresses[codinome]);
    }

    function issueToken(string memory codinome, uint256 sats) public isSuperUser() unauthorizedRecipient(addresses[codinome]) {
        _mint(addresses[codinome], sats);
    }

    function vote(string memory codinome, uint256 sats) public unauthorizedSender() 
                                                               unauthorizedRecipient(addresses[codinome])
                                                               cantVoteForYourself(codinome)
                                                               voteActivated()
                                                               oneVoteToRecipient(codinome)
                                                               onlyTwoSats(sats) {
        _mint(addresses[codinome], sats);
        _mint(msg.sender, VOTE_REWARD); // Reward for voting
        voted[msg.sender][codinome] = true; // Mark that the user has voted

        emit Voted(msg.sender, codinome, sats);
    }

    function votingOn() public isSuperUser() {
        votingActive = true;
    }

    function votingOff() public isSuperUser() {
        votingActive = false;
    }

    function getAllBalances() public view returns (string[] memory, uint256[] memory) {
        uint256[] memory amounts = new uint256[](ACCOUNT_NUMBER);

        for (uint256 i=0; i< ACCOUNT_NUMBER; i++) {
            amounts[i] = balanceOf(addresses[codinomes[i]]);
        }

        return (codinomes, amounts);
    }
}
