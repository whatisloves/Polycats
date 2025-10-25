import { NextRequest, NextResponse } from 'next/server';
import { addCat } from '@/lib/storage';
import { calculateRarityScore } from '@/lib/breeding';
import { generateKyrgyzName } from '@/lib/nameGenerator';
import { contractWithSigner, encodeDNA, parseDNA, calculateRarityScoreFromDNA } from '@/lib/web3';
import { ethers } from 'ethers';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

export async function POST(request: NextRequest) {
  try {
    // Check for the plugin secret header
    const secret = request.headers.get('X-Plugin-Secret');

    if (secret !== API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wallet, catUuid, dna: dnaString } = body;

    if (!wallet || !catUuid) {
      return NextResponse.json({ error: 'Missing wallet or catUuid' }, { status: 400 });
    }

    if (!contractWithSigner) {
      return NextResponse.json({ error: 'Contract not configured' }, { status: 500 });
    }

    // Parse DNA string (format: "variant,collarColor,speed,luck,strength,regen,defense")
    const dnaParts = dnaString.split(',').map((s: string) => parseInt(s));
    const [variant, collarColor, speed, luck, strength, regen, defense] = dnaParts;

    // Encode DNA for contract
    const dna = encodeDNA({
      variant,
      collarColor,
      speed,
      luck,
      strength,
      regen,
      defense,
      generation: 0,
      isGenesis: true,
    });

    // Generate random seed for name generation
    const seed = ethers.randomBytes(32);

    console.log(`Minting genesis cat for ${wallet}...`);

    // Mint cat on blockchain
    const mintTx = await contractWithSigner.mintCat(
      wallet,
      dna,
      seed,
      '', // Empty metadata URI (not using IPFS for demo)
      [0, 0] // No parents for genesis cats
    );

    console.log('Waiting for transaction confirmation...');
    const receipt = await mintTx.wait();
    console.log('✅ Mint transaction confirmed:', receipt.hash);

    // Extract token ID from CatMinted event
    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contractWithSigner.interface.parseLog(log);
        return parsed?.name === 'CatMinted';
      } catch {
        return false;
      }
    });

    if (!mintEvent) {
      throw new Error('CatMinted event not found');
    }

    const parsedEvent = contractWithSigner.interface.parseLog(mintEvent);
    const tokenId = Number(parsedEvent.args.tokenId);

    console.log(`Cat minted with tokenId: ${tokenId}`);

    // Read cat data from blockchain
    const catData = await contractWithSigner.getCat(tokenId);
    const catDNA = parseDNA(catData[0]);
    const rarityScore = calculateRarityScoreFromDNA(catDNA);
    const catName = generateKyrgyzName(rarityScore, tokenId);

    // Store in database (cache)
    const cat = addCat({
      owner: wallet.toLowerCase(),
      name: catName,
      dna: dnaString,
      stats: {
        speed: catDNA.speed,
        strength: catDNA.strength,
        defense: catDNA.defense,
        regen: catDNA.regen,
        luck: catDNA.luck,
      },
      generation: 0,
      isGenesis: true,
      parent1Id: null,
      parent2Id: null,
      rarityScore,
      cooldownUntil: 0,
      textureUrl: `https://api.dicebear.com/7.x/lorelei/png?seed=${tokenId}`,
    });

    console.log(`✅ Cat claimed: ${cat.name} (Token ${tokenId}) for ${wallet}`);

    return NextResponse.json({
      success: true,
      tokenId: cat.tokenId,
      transactionHash: receipt.hash,
      catName: cat.name,
      stats: cat.stats,
      rarityScore: cat.rarityScore,
      error: null,
    });

  } catch (error) {
    console.error('Claim API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}