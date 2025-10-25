import { NextRequest, NextResponse } from 'next/server';
import { generateRandomStats } from '@/lib/breeding';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

export async function POST(request: NextRequest) {
  try {
    // Check for the plugin secret header
    const secret = request.headers.get('X-Plugin-Secret');

    if (secret !== API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, always allow spawning (in production, you'd check daily limits, etc.)
    const response = {
      canSpawn: true,
      dna: generateRandomDNA(),
      message: 'Cat spawn approved'
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Spawn API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateRandomDNA(): string {
  // Generate random DNA string for genesis cats (stats 1-5)
  const variant = Math.floor(Math.random() * 11); // 0-10 (11 vanilla cat types)
  const collarColor = Math.floor(Math.random() * 16); // 0-15 (16 dye colors)

  // Use breeding utility for genesis stats (1-5 range)
  const stats = generateRandomStats(1, 5);

  return `${variant},${collarColor},${stats.speed},${stats.luck},${stats.strength},${stats.regen},${stats.defense}`;
}