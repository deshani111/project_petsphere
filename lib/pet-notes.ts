export type PetNotes = {
  about: string;
  careInstructions: string;
};

const ABOUT_MARKER = "About:\n";
const CARE_MARKER = "\n\nCare Instructions:\n";

export function combinePetNotes(about: string, careInstructions: string) {
  const normalizedAbout = about.trim();
  const normalizedCareInstructions = careInstructions.trim();

  if (!normalizedAbout && !normalizedCareInstructions) {
    return "";
  }

  return `${ABOUT_MARKER}${normalizedAbout}${CARE_MARKER}${normalizedCareInstructions}`;
}

export function parsePetNotes(notes: string | null | undefined): PetNotes {
  const value = notes || "";

  if (!value.trim()) {
    return { about: "", careInstructions: "" };
  }

  if (!value.startsWith(ABOUT_MARKER)) {
    return { about: value.trim(), careInstructions: "" };
  }

  const careMarkerIndex = value.indexOf(CARE_MARKER, ABOUT_MARKER.length);

  if (careMarkerIndex === -1) {
    return { about: value, careInstructions: "" };
  }

  return {
    about: value.slice(ABOUT_MARKER.length, careMarkerIndex).trim(),
    careInstructions: value.slice(careMarkerIndex + CARE_MARKER.length).trim(),
  };
}
