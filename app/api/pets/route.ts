import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../node_modules/.prisma/client';
import { NextResponse } from 'next/server';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const pets = await prisma.pet.findMany();
  return NextResponse.json(pets);
}