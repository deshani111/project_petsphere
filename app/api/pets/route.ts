import { prisma } from '../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const pets = await prisma.pet.findMany();
  return NextResponse.json(pets);
}