export type PetNotes = {
  about: string;
  careInstructions: string;
  medications: string;
  sterilized: string;
  lastDentalVaccination: string;
};

const ABOUT_MARKER = "About:\n";
const CARE_MARKER = "\n\nCare Instructions:\n";
const MEDICATIONS_MARKER = "\n\nMedications:\n";
const STERILIZED_MARKER = "\n\nSterilization Status:\n";
const LAST_DENTAL_MARKER = "\n\nLast Dental / Vaccination:\n";

export function combinePetNotes(
  about: string,
  careInstructions: string,
  medications: string,
  sterilized?: string,
  lastDentalVaccination?: string,
) {
  const normalizedAbout = about.trim();
  const normalizedCare = careInstructions.trim();
  const normalizedMedications = medications.trim();
  const normalizedSterilized = (sterilized || "").trim();
  const normalizedLastDental = (lastDentalVaccination || "").trim();

  if (!normalizedAbout && !normalizedCare && !normalizedMedications && !normalizedSterilized && !normalizedLastDental) {
    return "";
  }

  return (
    `${ABOUT_MARKER}${normalizedAbout}` +
    `${CARE_MARKER}${normalizedCare}` +
    `${MEDICATIONS_MARKER}${normalizedMedications}` +
    `${STERILIZED_MARKER}${normalizedSterilized}` +
    `${LAST_DENTAL_MARKER}${normalizedLastDental}`
  );
}

export function parsePetNotes(
  notes: string | null | undefined
): PetNotes {
  const value = notes || "";

  if (!value.trim()) {
    return {
      about: "",
      careInstructions: "",
      medications: "",
      sterilized: "",
      lastDentalVaccination: "",
    };
  }

  const aboutStart = value.indexOf(ABOUT_MARKER);
  const careStart = value.indexOf(CARE_MARKER);
  const medicationsStart = value.indexOf(MEDICATIONS_MARKER);
  const sterilizedStart = value.indexOf(STERILIZED_MARKER);
  const lastDentalStart = value.indexOf(LAST_DENTAL_MARKER);

  const about =
    aboutStart !== -1
      ? value
          .slice(
            aboutStart + ABOUT_MARKER.length,
            careStart !== -1 ? careStart : value.length,
          )
          .trim()
      : "";

  const careInstructions =
    careStart !== -1
      ? value
          .slice(
            careStart + CARE_MARKER.length,
            medicationsStart !== -1 ? medicationsStart : value.length,
          )
          .trim()
      : "";

  const medications =
    medicationsStart !== -1
      ? value.slice(medicationsStart + MEDICATIONS_MARKER.length, sterilizedStart !== -1 ? sterilizedStart : value.length).trim()
      : "";

  const sterilized =
    sterilizedStart !== -1
      ? value.slice(sterilizedStart + STERILIZED_MARKER.length, lastDentalStart !== -1 ? lastDentalStart : value.length).trim()
      : "";

  const lastDentalVaccination =
    lastDentalStart !== -1
      ? value.slice(lastDentalStart + LAST_DENTAL_MARKER.length).trim()
      : "";

  return { about, careInstructions, medications, sterilized, lastDentalVaccination };
}
