import { NextResponse } from 'next/server';
import {
  getBattle,
  updateBattle,
  getPendingChallengeForPlayer,
} from '@/lib/storage';

const API_SECRET = process.env.API_SECRET || 'dev-secret-12345';

interface AcceptRequest {
  battleId: string;
  accepter: string; // wallet address
}

export async function POST(request: Request) {
  // Verify API secret
  const secret = request.headers.get('X-Plugin-Secret');
  if (secret !== API_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body: AcceptRequest = await request.json();

  // Get battle
  const battle = getBattle(body.battleId);

  if (!battle) {
    return NextResponse.json({
      success: false,
      error: 'Battle not found',
    });
  }

  // Verify accepter is the challenged player
  if (battle.challenged.toLowerCase() !== body.accepter.toLowerCase()) {
    return NextResponse.json({
      success: false,
      error: 'Not your challenge',
    });
  }

  // Check battle is still pending
  if (battle.state !== 'PENDING') {
    return NextResponse.json({
      success: false,
      error: `Battle is ${battle.state.toLowerCase()}`,
    });
  }

  // Check not expired (30 sec timeout)
  const now = Date.now();
  const created = battle.startTime;
  if (now - created > 30000) {
    updateBattle(body.battleId, {
      state: 'CANCELLED',
      reason: 'timeout',
    });

    return NextResponse.json({
      success: false,
      error: 'Challenge expired',
    });
  }

  // Mark battle as IN_PROGRESS
  updateBattle(body.battleId, {
    state: 'IN_PROGRESS',
    startTime: Date.now(), // Reset start time for 5-min battle timer
  });

  return NextResponse.json({
    success: true,
    startTime: new Date().toISOString(),
    battleId: body.battleId,
    message: 'Battle started! Winner decided by death/quit or 5-min timeout.',
  });
}
