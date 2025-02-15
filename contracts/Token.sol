//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Token is ERC20 {
    // Criei essas constantes, mas colocar direto no código é feio demais.
    uint256 constant ACCOUNT_NUMBER = 19;
    uint256 constant VOTE_REWARD = 0.2 * 10**18;
    uint256 constant MAX_MINT_VOTE = 2 * 10**18;

    address public owner;
    address public professora = 0x502542668aF09fa7aea52174b9965A7799343Df7;
    bool public votingActive = true;

    string[] codinomes = new string[](ACCOUNT_NUMBER);
    
    mapping(address => string) codinomes_mp;
    mapping(string => address) addresses;
    mapping(address => mapping(string => bool)) public voted; // Track voting

    event Voted(string sender, string recipient, uint256 amount);

    constructor() ERC20("Turing", "TUR") {
        owner = msg.sender;
    
        address[ACCOUNT_NUMBER] memory addressList = [
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
            0x976EA74026E726554dB657fA54763abd0C3a0aa9,
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,
            0xa0Ee7A142d267C1f36714E4a8F75612F20a79720,
            0xBcd4042DE499D14e55001CcbB24a551F3b954096,
            0x71bE63f3384f5fb98995898A86B02Fb2426c5788,
            0xFABB0ac9d68B0B445fB7357272Ff202C5651694a,
            0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec,
            0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097,
            0xcd3B766CCDd6AE721141F452C550Ca635964ce71,
            0x2546BcD3c84621e976D8185a91A922aE77ECEc30,
            0xbDA5747bFD65F08deb54cb465eB87D40e51B197E,
            0xdD2FD4581271e230360230F9337D5c0430Bf44C0,
            0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
        ];

        string memory codinomeI;

        for (uint256 i=0; i< ACCOUNT_NUMBER; i++) {
            codinomeI = string.concat("nome", Strings.toString(i+1));
            
            codinomes[i] = codinomeI;
            addresses[codinomeI] = addressList[i];
            codinomes_mp[addressList[i]] = codinomeI;
        }
    }

    modifier isSuperUser() {
        require(msg.sender == owner || msg.sender == professora, "Permissao negada, apenas owner ou a professora!");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || msg.sender == professora || bytes(codinomes_mp[msg.sender]).length != 0,
            "Conta nao autorizada!"
        );
        _;
    }


    modifier unauthorizedSender() {
        require(bytes(codinomes_mp[msg.sender]).length != 0, "Remetente nao autorizado!");
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
        require(sats <= MAX_MINT_VOTE && sats >= 0, "Quantidade de tokens invalida! Valores aceitos estao entre 0 e 2!");
        _;
    }

    function balanceByCodiname(string memory codinome) unauthorizedRecipient(addresses[codinome]) external view returns (uint256) {
        return balanceOf(addresses[codinome]);
    }

    function issueToken(string memory codinome, uint256 sats) external isSuperUser() unauthorizedRecipient(addresses[codinome]) {
        _mint(addresses[codinome], sats);
    }

    function vote(string memory codinome, uint256 sats) external voteActivated()
                                                               unauthorizedSender() 
                                                               unauthorizedRecipient(addresses[codinome])
                                                               cantVoteForYourself(codinome)
                                                               oneVoteToRecipient(codinome)
                                                               onlyTwoSats(sats) {
        _mint(addresses[codinome], sats);
        _mint(msg.sender, VOTE_REWARD); // Reward for voting
        voted[msg.sender][codinome] = true; // Mark that the user has voted

        emit Voted(codinomes_mp[msg.sender], codinome, sats);
    }

    function votingOn() external isSuperUser() {
        votingActive = true;
    }

    function votingOff() external isSuperUser() {
        votingActive = false;
    }

    function getAllBalances() external view returns (string[] memory, uint256[] memory) {
        uint256[] memory amounts = new uint256[](ACCOUNT_NUMBER);

        for (uint256 i=0; i< ACCOUNT_NUMBER; i++) {
            amounts[i] = balanceOf(addresses[codinomes[i]]);
        }

        return (codinomes, amounts);
    }

    function getSenderCodinome() external view onlyAuthorized() returns (string memory) {
        if (msg.sender == owner) return "Owner";
        if (msg.sender == professora) return "Professora";
        return codinomes_mp[msg.sender];
    }
}
