import { VERIFICATION_DOCUMENT_TYPES } from "../verification-documents";

const PROFILE_FIELDS = ["fullName", "firstName", "lastName", "email", "phone", "address", "serviceArea", "bio", "professionalTitle", "notificationsEnabled"];

export function cleanString(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseBooleanValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return null;
}

export function hasProfileFields(body) {
  if (!body || typeof body !== "object") return false;

  return PROFILE_FIELDS.some((field) => {
    if (field === "notificationsEnabled") return body[field] !== undefined;
    return body[field] !== undefined && body[field] !== null && String(body[field]).trim() !== "";
  });
}

export function parseFullName(body, fallbackFirstName = "", fallbackLastName = "") {
  const fullName = cleanString(body?.fullName, 210);
  if (fullName) {
    const [firstName, ...rest] = fullName.split(/\s+/).filter(Boolean);
    return {
      firstName: cleanString(firstName, 100),
      lastName: cleanString(rest.join(" "), 100),
    };
  }

  return {
    firstName: cleanString(body?.firstName ?? fallbackFirstName, 100),
    lastName: cleanString(body?.lastName ?? fallbackLastName, 100),
  };
}

export function normalizeProfileInput(body, sitter) {
  const profileFieldsPresent = hasProfileFields(body);
  const notificationsEnabled = parseBooleanValue(body?.notificationsEnabled);
  const name = parseFullName(body, sitter.users.first_name ?? "", sitter.users.last_name ?? "");

  return {
    profileFieldsPresent,
    notificationsEnabled,
    firstName: name.firstName,
    lastName: name.lastName,
    email: cleanString(body?.email ?? sitter.users.email ?? "", 255).toLowerCase(),
    phone: cleanString(body?.phone ?? sitter.users.phone_number ?? "", 20),
    address: cleanString(body?.address ?? sitter.address ?? "", 255),
    serviceArea: cleanString(body?.serviceArea ?? sitter.service_area ?? "", 150),
    bio: cleanString(body?.bio ?? sitter.bio ?? "", 2000),
    professionalTitle: cleanString(body?.professionalTitle ?? sitter.professional_title ?? "Pet Sitter", 150) || "Pet Sitter",
  };
}

export function parseVerificationFiles(formData) {
  return VERIFICATION_DOCUMENT_TYPES.map((type) => [type, formData.get(type)]).filter(([, file]) => file && typeof file === "object" && file.size > 0);
}

export async function parseProfileRequest(request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const body = Object.fromEntries(
      ["fullName", "firstName", "lastName", "email", "phone", "address", "serviceArea", "bio", "professionalTitle", "notificationsEnabled"].map((key) => [key, form.get(key)])
    );

    return {
      body,
      files: parseVerificationFiles(form),
    };
  }

  const body = await request.json().catch(() => null);

  return {
    body,
    files: [],
  };
}

export function validateProfileInput(input) {
  if (!input.profileFieldsPresent) {
    if (input.notificationsEnabled === null) {
      return "No changes were submitted.";
    }

    return null;
  }

  if (!input.firstName || !input.lastName) {
    return "Please enter your first and last name.";
  }

  if (!input.email || !/^\S+@\S+\.\S+$/.test(input.email)) {
    return "Please provide a valid email address.";
  }

  if (input.phone && !/^[+0-9()\-\s]{8,20}$/.test(input.phone)) {
    return "Please provide a valid phone number.";
  }

  if (!input.serviceArea) {
    return "Please provide your city or service area.";
  }

  if (!input.professionalTitle) {
    return "Please provide a professional title.";
  }

  return null;
}