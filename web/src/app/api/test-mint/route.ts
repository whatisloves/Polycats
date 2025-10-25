import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the claim endpoint
    const testWallet = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
    const testCatUuid = "test-cat-" + Date.now();
    
    const response = await fetch('http://localhost:3000/api/minecraft/claim', {
      method: 'POST',
      headers: {
        'X-Plugin-Secret': 'dev-secret-12345',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wallet: testWallet,
        catUuid: testCatUuid
      })
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      message: "Test minting result",
      wallet: testWallet,
      catUuid: testCatUuid,
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
