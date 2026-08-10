export type ApiPet = {
  pet_id: string;
  owner_id: string;
  pet_name: string;
  species: string | null;
  breed: string | null;
  gender: string | null;
  age: number | null;
  weight_kg: string | null;
  photo: string | null;
  medical_notes: string | null;
  created_date: string;
};

export async function getApiMessage(response: Response) {
  const payload = await response.json().catch(() => null);
  return payload?.message || "Something went wrong. Please try again.";
}
