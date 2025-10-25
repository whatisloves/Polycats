import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const config = {
    contractAddress: process.env.CONTRACT_ADDRESS || 'NOT_SET',
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'NOT_SET',
    privateKey: process.env.DEPLOYER_PRIVATE_KEY ? 'SET' : 'NOT_SET',
    etherscanApiKey: process.env.ETHERSCAN_API_KEY ? 'SET' : 'NOT_SET',
  };

  return NextResponse.json({
    status: 'Backend configuration check',
    config,
    timestamp: new Date().toISOString(),
  });
}
