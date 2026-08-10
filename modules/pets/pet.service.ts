import { prisma } from "../../lib/prisma";
import type { PetCreateInput, PetUpdateInput } from "./pet.validation";

export class PetNotFoundError extends Error {
  constructor(message = "Pet not found.") {
    super(message);
    this.name = "PetNotFoundError";
  }
}

export class PetOwnershipError extends Error {
  constructor(message = "You do not have permission to access this pet.") {
    super(message);
    this.name = "PetOwnershipError";
  }
}

type PetRecord = {
  pet_id: bigint;
  owner_id: bigint;
  pet_name: string;
  species: string | null;
  breed: string | null;
  gender: string | null;
  age: number | null;
  weight_kg: { toString(): string } | null;
  photo: string | null;
  medical_notes: string | null;
  created_date: Date;
};

export function serializePet(pet: PetRecord) {
  return {
    pet_id: pet.pet_id.toString(),
    owner_id: pet.owner_id.toString(),
    pet_name: pet.pet_name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    age: pet.age,
    weight_kg: pet.weight_kg?.toString() ?? null,
    photo: pet.photo,
    medical_notes: pet.medical_notes,
    created_date: pet.created_date.toISOString(),
  };
}

export async function listPets(ownerId: bigint) {
  return prisma.pet.findMany({
    where: { owner_id: ownerId },
    orderBy: { created_date: "desc" },
  });
}

export async function createPet(ownerId: bigint, input: PetCreateInput) {
  return prisma.pet.create({
    data: {
      owner_id: ownerId,
      ...input,
    },
  });
}

export async function getPetForOwner(ownerId: bigint, petId: bigint) {
  const pet = await prisma.pet.findUnique({
    where: { pet_id: petId },
  });

  if (!pet) {
    throw new PetNotFoundError();
  }

  if (pet.owner_id !== ownerId) {
    throw new PetOwnershipError();
  }

  return pet;
}

export async function updatePet(
  ownerId: bigint,
  petId: bigint,
  input: PetUpdateInput
) {
  await getPetForOwner(ownerId, petId);

  return prisma.pet.update({
    where: { pet_id: petId },
    data: input,
  });
}

export async function deletePet(ownerId: bigint, petId: bigint) {
  await getPetForOwner(ownerId, petId);

  return prisma.pet.delete({
    where: { pet_id: petId },
  });
}
