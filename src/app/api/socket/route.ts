import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Socket.io is not supported in App Router API routes. Use a custom server.' 
  }, { status: 501 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Socket.io is not supported in App Router API routes. Use a custom server.' 
  }, { status: 501 });
} 
 
 