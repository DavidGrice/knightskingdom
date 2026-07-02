import { NextResponse } from 'next/server';

/**
 * Stub API route — mirrors the CRA fetch('/updateUserData') fallback.
 * Persistence is handled client-side via localStorage in persistUserData.
 */
export async function POST(request) {
  try {
    await request.json();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}