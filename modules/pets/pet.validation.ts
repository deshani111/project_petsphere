export type PetCreateInput = {
  pet_name: string;
  species?: string;
  breed?: string;
  gender?: "male" | "female" | "unknown";
  age?: number;
  weight_kg?: number;
  photo?: string;
  medical_notes?: string;
};

export type PetUpdateInput = Partial<PetCreateInput>;

export class PetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PetValidationError";
  }
}

type InputRecord = Record<string, unknown>;

function getInputRecord(body: unknown): InputRecord {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new PetValidationError("Please submit valid pet details.");
  }

  return body as InputRecord;
}

function requiredPetName(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new PetValidationError("pet_name is required and must be a string.");
  }

  return value.trim();
}

function optionalString(input: InputRecord, field: string): string | undefined {
  if (!(field in input)) {
    return undefined;
  }

  if (typeof input[field] !== "string") {
    throw new PetValidationError(`${field} must be a string.`);
  }

  return input[field].trim();
}

function optionalGender(input: InputRecord): PetCreateInput["gender"] | undefined {
  if (!("gender" in input)) {
    return undefined;
  }

  if (typeof input.gender !== "string") {
    throw new PetValidationError("gender must be male, female, or unknown.");
  }

  const gender = input.gender.trim().toLowerCase();

  if (gender !== "male" && gender !== "female" && gender !== "unknown") {
    throw new PetValidationError("gender must be male, female, or unknown.");
  }

  return gender;
}

function optionalAge(input: InputRecord): number | undefined {
  if (!("age" in input)) {
    return undefined;
  }

  if (typeof input.age !== "number" || !Number.isInteger(input.age) || input.age < 0) {
    throw new PetValidationError("age must be an integer greater than or equal to 0.");
  }

  return input.age;
}

function optionalWeight(input: InputRecord): number | undefined {
  if (!("weight_kg" in input)) {
    return undefined;
  }

  const weight = input.weight_kg;

  if (
    typeof weight !== "number" ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    weight > 999.99 ||
    !Number.isInteger(weight * 100)
  ) {
    throw new PetValidationError(
      "weight_kg must be a positive number with no more than 2 decimal places."
    );
  }

  return weight;
}

function validatePetFields(input: InputRecord, requirePetName: boolean): PetUpdateInput {
  const pet: PetUpdateInput = {};

  if (requirePetName) {
    pet.pet_name = requiredPetName(input.pet_name);
  } else if ("pet_name" in input) {
    pet.pet_name = requiredPetName(input.pet_name);
  }

  const species = optionalString(input, "species");
  const breed = optionalString(input, "breed");
  const gender = optionalGender(input);
  const age = optionalAge(input);
  const weight = optionalWeight(input);
  const photo = optionalString(input, "photo");
  const medicalNotes = optionalString(input, "medical_notes");

  if (species !== undefined) pet.species = species;
  if (breed !== undefined) pet.breed = breed;
  if (gender !== undefined) pet.gender = gender;
  if (age !== undefined) pet.age = age;
  if (weight !== undefined) pet.weight_kg = weight;
  if (photo !== undefined) pet.photo = photo;
  if (medicalNotes !== undefined) pet.medical_notes = medicalNotes;

  return pet;
}

export function validateCreatePetInput(body: unknown): PetCreateInput {
  const pet = validatePetFields(getInputRecord(body), true);
  return pet as PetCreateInput;
}

export function validateUpdatePetInput(body: unknown): PetUpdateInput {
  const pet = validatePetFields(getInputRecord(body), false);

  if (Object.keys(pet).length === 0) {
    throw new PetValidationError("Please provide at least one pet field to update.");
  }

  return pet;
}

export function parsePetId(value: string): bigint {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new PetValidationError("Please provide a valid pet ID.");
  }

  return BigInt(value);
}
