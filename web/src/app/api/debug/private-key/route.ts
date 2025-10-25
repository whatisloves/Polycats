import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET(request: NextRequest) {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '';
  
  const debug: any = {
    hasPrivateKey: !!privateKey,
    privateKeyLength: privateKey.length,
    privateKeyPreview: privateKey.substring(0, 10) + '...' + privateKey.substring(privateKey.length - 10),
    isValidFormat: /^0x[a-fA-F0-9]{64}$/.test(privateKey),
  };

  try {
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey);
      debug['address'] = wallet.address;
      debug['isValid'] = true;
    } else {
      debug['isValid'] = false;
      debug['error'] = 'No private key provided';
    }
  } catch (error: any) {
    debug['isValid'] = false;
    debug['error'] = error.message;
    debug['errorCode'] = error.code;
  }

  return NextResponse.json({
    status: 'Private key debug',
    debug,
    timestamp: new Date().toISOString(),
  });
}
