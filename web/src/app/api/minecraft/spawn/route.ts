import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check for the plugin secret header
    const secret = request.headers.get('X-Plugin-Secret');
    const expectedSecret = 'dev-secret-12345';
    
    if (secret !== expectedSecret) {
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
  // Generate a simple random DNA string for testing
  const variant = Math.floor(Math.random() * 11); // 0-10 (11 vanilla cat types)
  const collarColor = Math.floor(Math.random() * 16); // 0-15 (16 dye colors)
  const speed = Math.floor(Math.random() * 10) + 1; // 1-10
  const luck = Math.floor(Math.random() * 10) + 1; // 1-10
  const strength = Math.floor(Math.random() * 10) + 1; // 1-10
  const regen = Math.floor(Math.random() * 10) + 1; // 1-10
  const defense = Math.floor(Math.random() * 10) + 1; // 1-10

  return `${variant},${collarColor},${speed},${luck},${strength},${regen},${defense}`;
}