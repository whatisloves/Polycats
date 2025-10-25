// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BlockCatsNFT
 * @dev NFT contract for BlockCats with on-chain DNA storage and daily limits
 */
contract BlockCatsNFT is ERC721, ERC721URIStorage, Ownable {
    // Cat DNA structure - stores all genetic information
    struct CatDNA {
        uint8 variant;       // 0-10 (11 vanilla cat types)
        uint8 collarColor;   // 0-15 (16 dye colors)
        uint8 speed;         // 1-10 stat
        uint8 luck;          // 1-10 stat
        uint8 strength;      // 1-10 stat
        uint8 regen;         // 1-10 stat
        uint8 defense;       // 1-10 stat
        uint8 generation;    // 0 = genesis, 1+ = bred
        bool isGenesis;      // true = genesis, false = bred
    }

    // State variables
    uint256 private _nextTokenId;

    // DNA and metadata storage
    mapping(uint256 => CatDNA) public dna;
    mapping(uint256 => bytes32) public nameSeed;
    mapping(uint256 => uint256) public birthTimestamp;
    mapping(uint256 => uint256[2]) public parents;

    // Daily limits
    uint256 public dailyMintCount;
    uint256 public constant MAX_DAILY_MINTS = 10;
    uint256 public lastResetDay;

    // Events
    event CatMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256[2] parents
    );

    event CatBred(
        uint256 indexed childId,
        uint256 indexed parent1Id,
        uint256 indexed parent2Id
    );

    event DailyLimitReset(uint256 newDay, uint256 previousCount);

    constructor() ERC721("BlockCats", "BCAT") Ownable(msg.sender) {
        lastResetDay = block.timestamp / 1 days;
    }

    /**
     * @dev Mint new cat NFT (only owner = backend)
     * @param to Recipient address
     * @param _dna DNA structure with all traits
     * @param _seed Random seed for deterministic name generation
     * @param metadataURI IPFS URI for metadata
     * @param _parents Parent token IDs [mom, dad] or [0,0] for genesis
     */
    function mintCat(
        address to,
        CatDNA memory _dna,
        bytes32 _seed,
        string memory metadataURI,
        uint256[2] memory _parents
    ) public onlyOwner returns (uint256) {
        // Check and reset daily limit if needed
        _checkAndResetDailyLimit();
        require(dailyMintCount < MAX_DAILY_MINTS, "Daily mint limit reached");

        uint256 tokenId = _nextTokenId++;

        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        // Store on-chain data
        dna[tokenId] = _dna;
        nameSeed[tokenId] = _seed;
        birthTimestamp[tokenId] = block.timestamp;
        parents[tokenId] = _parents;

        // Increment daily counter
        dailyMintCount++;

        // Emit event for indexing
        emit CatMinted(tokenId, to, _parents);

        return tokenId;
    }

    /**
     * @dev Breed two cats to create offspring (called after PvP battle)
     * @param parent1Id First parent token ID
     * @param parent2Id Second parent token ID
     * @param winner Address of battle winner (receives child)
     * @param metadataURI Metadata URI for child NFT
     */
    function breedCats(
        uint256 parent1Id,
        uint256 parent2Id,
        address winner,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(_ownerOf(parent1Id) != address(0), "Parent 1 doesn't exist");
        require(_ownerOf(parent2Id) != address(0), "Parent 2 doesn't exist");

        CatDNA memory p1 = dna[parent1Id];
        CatDNA memory p2 = dna[parent2Id];

        // Calculate child stats using breeding algorithm
        uint8[5] memory childStats;
        childStats[0] = _breedStat(parent1Id, parent2Id, p1.speed, p2.speed, 0, p1.generation, p2.generation);
        childStats[1] = _breedStat(parent1Id, parent2Id, p1.strength, p2.strength, 1, p1.generation, p2.generation);
        childStats[2] = _breedStat(parent1Id, parent2Id, p1.defense, p2.defense, 2, p1.generation, p2.generation);
        childStats[3] = _breedStat(parent1Id, parent2Id, p1.regen, p2.regen, 3, p1.generation, p2.generation);
        childStats[4] = _breedStat(parent1Id, parent2Id, p1.luck, p2.luck, 4, p1.generation, p2.generation);

        uint8 childGeneration = (p1.generation > p2.generation ? p1.generation : p2.generation) + 1;

        CatDNA memory childDNA = CatDNA({
            variant: p1.variant,           // Inherit from parent 1
            collarColor: p2.collarColor,   // Inherit from parent 2
            speed: childStats[0],
            luck: childStats[4],
            strength: childStats[1],
            regen: childStats[3],
            defense: childStats[2],
            generation: childGeneration,
            isGenesis: false
        });

        uint256 childId = _nextTokenId++;
        _safeMint(winner, childId);
        _setTokenURI(childId, metadataURI);

        dna[childId] = childDNA;
        nameSeed[childId] = bytes32(0); // No seed for bred cats
        birthTimestamp[childId] = block.timestamp;
        parents[childId] = [parent1Id, parent2Id];

        emit CatBred(childId, parent1Id, parent2Id);
        emit CatMinted(childId, winner, [parent1Id, parent2Id]);

        return childId;
    }

    /**
     * @dev Calculate child stat from parents using deterministic breeding algorithm
     * @param parent1Id Parent 1 token ID (for seed)
     * @param parent2Id Parent 2 token ID (for seed)
     * @param parent1Stat Parent 1's stat value
     * @param parent2Stat Parent 2's stat value
     * @param statIndex Stat type (0-4) for unique randomness per stat
     * @param parent1Generation Parent 1's generation
     * @param parent2Generation Parent 2's generation
     */
    function _breedStat(
        uint256 parent1Id,
        uint256 parent2Id,
        uint8 parent1Stat,
        uint8 parent2Stat,
        uint8 statIndex,
        uint8 parent1Generation,
        uint8 parent2Generation
    ) internal pure returns (uint8) {
        // 1. Average of both parents
        uint8 baseValue = (parent1Stat + parent2Stat) / 2;

        // 2. Deterministic mutation based on parent IDs + stat type
        uint256 seed = uint256(keccak256(abi.encode(parent1Id, parent2Id, statIndex)));
        uint256 roll = seed % 100;

        int8 mutation = 0;
        if (roll < 5) mutation = -1;        // 5% chance: -1
        else if (roll < 25) mutation = 0;   // 20% chance: +0
        else if (roll < 65) mutation = 1;   // 40% chance: +1
        else mutation = 2;                  // 35% chance: +2

        // 3. Generational bonus (every 2 generations adds +1)
        uint8 maxGen = parent1Generation > parent2Generation ? parent1Generation : parent2Generation;
        uint8 generationalBonus = maxGen / 2;

        // 4. Calculate final stat
        int16 result = int16(int8(baseValue)) + int16(mutation) + int16(int8(generationalBonus));

        // 5. Clamp to 1-10
        if (result < 1) return 1;
        if (result > 10) return 10;
        return uint8(uint16(result));
    }

    /**
     * @dev Get all cat info in one call (saves RPC calls)
     * @param tokenId Token ID to query
     */
    function getCat(uint256 tokenId)
        public
        view
        returns (
            CatDNA memory catDna,
            bytes32 seed,
            uint256 birth,
            uint256[2] memory parentIds,
            string memory uri,
            address owner,
            uint16 rarityScore
        )
    {
        require(_ownerOf(tokenId) != address(0), "Token doesn't exist");

        catDna = dna[tokenId];
        seed = nameSeed[tokenId];
        birth = birthTimestamp[tokenId];
        parentIds = parents[tokenId];
        uri = tokenURI(tokenId);
        owner = ownerOf(tokenId);
        rarityScore = _calculateRarityScore(catDna);
    }

    /**
     * @dev Calculate rarity score from stats
     */
    function _calculateRarityScore(CatDNA memory _dna)
        private
        pure
        returns (uint16)
    {
        return uint16(_dna.speed) +
               uint16(_dna.luck) +
               uint16(_dna.strength) +
               uint16(_dna.regen) +
               uint16(_dna.defense);
    }

    /**
     * @dev Reset daily counter if it's a new day
     */
    function _checkAndResetDailyLimit() private {
        uint256 currentDay = block.timestamp / 1 days;

        if (currentDay > lastResetDay) {
            emit DailyLimitReset(currentDay, dailyMintCount);
            dailyMintCount = 0;
            lastResetDay = currentDay;
        }
    }

    /**
     * @dev Get current mint count and limit
     */
    function getMintStatus()
        public
        view
        returns (
            uint256 mintedToday,
            uint256 maxDaily,
            uint256 remaining
        )
    {
        return (
            dailyMintCount,
            MAX_DAILY_MINTS,
            MAX_DAILY_MINTS - dailyMintCount
        );
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    // Required overrides for Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
