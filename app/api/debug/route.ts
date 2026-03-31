import { NextResponse } from 'next/server'

// Temporary debug endpoint — delete after login is working
export async function GET() {
  return NextResponse.json({
    mum_set: !!process.env.MUM_PASSWORD,
    dad_set: !!process.env.DAD_PASSWORD,
    son_set: !!process.env.SON_PASSWORD,
    mum_len: process.env.MUM_PASSWORD?.length ?? 0,
    dad_len: process.env.DAD_PASSWORD?.length ?? 0,
    son_len: process.env.SON_PASSWORD?.length ?? 0,
  })
}
