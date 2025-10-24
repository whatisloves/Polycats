import { NextRequest, NextResponse } from 'next/server';

// Mock daily spawn counter
const mockState = {
  spawnsToday: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  MAX_SPAWNS: 10,
};

function resetIfNewDay() {
  const today = new Date().toISOString().split('T')[0];
  if (mockState.lastResetDate !== today) {
    mockState.spawnsToday = 0;
    mockState.lastResetDate = today;
  }
}

function generateRandomDNA(): string {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F0F0F0', '#2C2C2C', '#FF69B4'];
  const patterns = ['solid', 'striped', 'spotted'];
  const eyeColors = ['#00FF00', '#0000FF', '#FFD700'];

  const dna = {
    primaryColor: colors[Math.floor(Math.random() * colors.length)],
    secondaryColor: colors[Math.floor(Math.random() * colors.length)],
    pattern: patterns[Math.floor(Math.random() * patterns.length)],
    eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
    seed: Math.random().toString(36).substring(7),
  };

  return JSON.stringify(dna);
}

export async function POST(request: NextRequest) {
  // Check API secret
  const secret = request.headers.get('X-Plugin-Secret');
  if (secret !== 'dev-secret-12345') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Reset counter if new day
  resetIfNewDay();

  // Check daily limit
  if (mockState.spawnsToday >= mockState.MAX_SPAWNS) {
    return NextResponse.json({
      canSpawn: false,
      message: `Daily limit reached (${mockState.MAX_SPAWNS}/day)`,
    });
  }

  // Generate DNA and increment counter
  const dna = generateRandomDNA();
  mockState.spawnsToday++;

  console.log(`[SPAWN] Spawned cat #${mockState.spawnsToday} with DNA:`, dna);

  return NextResponse.json({
    canSpawn: true,
    dna,
  });
}
