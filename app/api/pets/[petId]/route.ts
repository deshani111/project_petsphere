import { NextResponse } from "next/server";
import { getCurrentOwnerId } from "../../../../lib/session";
import {
  deletePet,
  getPetForOwner,
  PetNotFoundError,
  PetOwnershipError,
  serializePet,
  updatePet,
} from "../../../../modules/pets/pet.service";
import {
  parsePetId,
  PetValidationError,
  validateUpdatePetInput,
} from "../../../../modules/pets/pet.validation";

type RouteContext = {
  params: Promise<{ petId: string }>;
};

function unauthorizedResponse() {
  return NextResponse.json({ message: "Please log in as a pet owner." }, { status: 401 });
}

function handlePetError(error: unknown) {
  if (error instanceof PetValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof PetOwnershipError) {
    return NextResponse.json({ message: error.message }, { status: 403 });
  }

  if (error instanceof PetNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return null;
}

async function getPetId(context: RouteContext) {
  const { petId } = await context.params;
  return parsePetId(petId);
}

export async function GET(_request: Request, context: RouteContext) {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return unauthorizedResponse();
  }

  try {
    const pet = await getPetForOwner(ownerId, await getPetId(context));
    return NextResponse.json(serializePet(pet));
  } catch (error) {
    const knownError = handlePetError(error);
    if (knownError) return knownError;

    console.error("Could not load pet:", error);
    return NextResponse.json({ message: "Could not load pet. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return unauthorizedResponse();
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Please submit valid pet details." }, { status: 400 });
  }

  try {
    const petId = await getPetId(context);
    const input = validateUpdatePetInput(body);
    const pet = await updatePet(ownerId, petId, input);

    return NextResponse.json({ message: "Pet updated successfully.", pet: serializePet(pet) });
  } catch (error) {
    const knownError = handlePetError(error);
    if (knownError) return knownError;

    console.error("Could not update pet:", error);
    return NextResponse.json({ message: "Could not update pet. Please try again." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return unauthorizedResponse();
  }

  try {
    await deletePet(ownerId, await getPetId(context));
    return NextResponse.json({ message: "Pet deleted successfully." });
  } catch (error) {
    const knownError = handlePetError(error);
    if (knownError) return knownError;

    console.error("Could not delete pet:", error);
    return NextResponse.json({ message: "Could not delete pet. Please try again." }, { status: 500 });
  }
}
