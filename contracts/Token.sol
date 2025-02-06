//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;


// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "My Hardhat Token";
    string public symbol = "MHT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 1000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;
    mapping(string => address) addresses;
    
    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * Contract initialization.
     */
    constructor() {
        // The totalSupply is assigned to the transaction sender, which is the
        // account that is deploying the contract.
        
        owner = msg.sender;
        votingOn()

        addresses["nome1"] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        addresses["nome2"] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        addresses["nome3"] = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        addresses["nome4"] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
        addresses["nome5"] = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
        addresses["nome6"] = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
        addresses["nome7"] = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        addresses["nome8"] = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        addresses["nome9"] = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        addresses["nome10"] = 0xBcf4042dE499d14e55001CcbB24A551F3B954096;
        addresses["nome11"] = 0x71bE63f3384f5fb98995898A86B02Fb2426c5788;
        addresses["nome12"] = 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a;
        addresses["nome13"] = 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec;
        addresses["nome14"] = 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097;
        addresses["nome15"] = 0xcd3B766CCDd6AE721141F452C550Ca635964ce71;
        addresses["nome16"] = 0x2546BcD3c84621e976D8185a91A922aE77ECEc30;
        addresses["nome17"] = 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E;
        addresses["nome18"] = 0xdD2FD4581271e230360230F9337D5c0430Bf44C0;
        addresses["nome19"] = 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199;
    }

    /**
     * A function to transfer tokens.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */
    function transfer(address to, uint256 amount) external {
        // Check if the transaction sender has enough tokens.
        // If `require`'s first argument evaluates to `false`, the
        // transaction will revert.
        require(balances[msg.sender] >= amount, "Not enough tokens");

        // Transfer the amount.
        balances[msg.sender] -= amount;
        balances[to] += amount;

        // Notify off-chain applications of the transfer.
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * Read only function to retrieve the token balance of a given account.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];  
    }

    /**
     * saTuring é a menor unidade de turing (10^-18)
     * Esse método poderá ser executado por apenas 2 usuários: o owner (quem fez o deploy) e a professora (0x502542668aF09fa7aea52174b9965A7799343Df7) !! 
     * Ele criará (minting!) a quantidade especificada de saTurings na carteira do receptor.
     */
    function issueToken(string memory codinome, uint256 sats) public {
        require (msg.sender == owner || msg.sender == 0x502542668aF09fa7aea52174b9965A7799343Df7, "Permissao negada, apenas owner ou a professora!");

        _mint(addresses[codinome], sats);
    }

    /**
    * Esse método pode ser executado por qualquer usuário autorizado (isto é, addr de um dos codinomes, mas um mesmo usuário só pode votar uma vez em um codinome). Além disso o próprio usuário NÃO pode votar em si mesmo. A quantidade de turings não pode ser maior do que 2 (ISTO É, neste caso 2*10^18 saTurings). A função deve dar erro se for maior que 2*10^18 saTurings!
    * Aqui haverá minting da quantidade de saTurings especificada, para o Addr associado ao codinome.
    * Além disso, a pessoa que vota também ganha 0,2 Turing!! (minting again!!)
    */
    
    function vote(string memory codinome, uint256 sats) public {
        require (addresses[codinome] != address(0), "Usuario nao autorizado");

        _mint(addresses[codinome], sats);

        // _mint(addresses[msg.sender], 0.2 * 10 ** 18)
    }

    /**
    * Este método poderá ser executado apenas pelo owner ou a professora. Após sua execução a votação pode ser executada 
    * (isto é, a função "vote()" poderá ser executada normalmente). No início do contrato (após o deploy), a votação deverá iniciar "ON". 
    */
    function votingOn() {
        require (msg.sender == owner || msg.sender == 0x502542668aF09fa7aea52174b9965A7799343Df7, "Permissao negada, apenas owner ou a professora!");
    }


    /**
    * Este método poderá ser executado apenas pelo owner ou a professora. Após sua execução 
    * interrompe-se a votação (isto é, se alguém executar "vote()" nada deve acontecer).
    
    */
    function votingOff() {
        require (msg.sender == owner || msg.sender == 0x502542668aF09fa7aea52174b9965A7799343Df7, "Permissao negada, apenas owner ou a professora!");
    }
}
