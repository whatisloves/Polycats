import { NextResponse } from 'next/server';

// This would normally come from the blockchain/database
// For now, just return a placeholder response
export async function GET() {
  return NextResponse.json({
    cats: [],
    total: 0,
    message: 'Mock API - cats will appear here after claiming',
  });
}
