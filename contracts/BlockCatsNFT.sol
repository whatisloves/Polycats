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
