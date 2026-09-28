import { NextResponse } from "next/server";
import { getCurrentOwnerId } from "../../../lib/session";
import {
  createPet,
  listPets,
  serializePet,
} from "../../../modules/pets/pet.service";
import {
  PetValidationError,
  validateCreatePetInput,
} from "../../../modules/pets/pet.validation";

function unauthorizedResponse() {
  return NextResponse.json({ message: "Please log in as a pet owner." }, { status: 401 });
}

export async function GET() {
  const ownerId = await getCurrentOwnerId();

  if (!ownerId) {
    return unauthorizedResponse();
  }

  try {
    const pets = await listPets(ownerId);
    return NextResponse.json(pets.map(serializePet));
  } catch (error) {
    console.error("Could not list pets:", error);
    return NextResponse.json({ message: "Could not load pets. Please try again." }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    const input = validateCreatePetInput(body);
    const pet = await createPet(ownerId, input);

    return NextResponse.json(
      { message: "Pet created successfully.", pet: serializePet(pet) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof PetValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Could not create pet:", error);
    return NextResponse.json({ message: "Could not create pet. Please try again." }, { status: 500 });
  }
}
