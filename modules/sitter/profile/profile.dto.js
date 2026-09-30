import { serialize } from "../sitter.service";
import { getVerificationStatus } from "../verification-documents";

function countActiveServices(sitter) {
  return (sitter.pet_sitter_service ?? []).filter((service) => service.is_active).length;
}

export function toSitterProfileDTO(sitter) {
  const documents = (sitter.verification_documents ?? []).map((document) => ({
    type: document.document_type,
    url: document.file_url,
    submittedAt: document.submitted_at,
  }));
  const activeServices = (sitter.pet_sitter_service ?? [])
    .filter((service) => service.is_active)
    .map((service) => service.service_type?.name)
    .filter(Boolean);

  const profile = {
    id: sitter.sitter_id,
    firstName: sitter.users?.first_name ?? "",
    lastName: sitter.users?.last_name ?? "",
    fullName: `${sitter.users?.first_name ?? ""} ${sitter.users?.last_name ?? ""}`.trim(),
    email: sitter.users?.email ?? "",
    phone: sitter.users?.phone_number ?? "",
    address: sitter.address ?? "",
    serviceArea: sitter.service_area ?? "",
    bio: sitter.bio ?? "",
    professionalTitle: sitter.professional_title ?? "Pet Sitter",
    profileImage: sitter.profile_image ?? null,
    notificationsEnabled: Boolean(sitter.notifications_enabled),
    isVerified: Boolean(sitter.is_verified),
    verificationStatus: getVerificationStatus(sitter),
    experienceYears: Number(sitter.experience_years ?? 0),
    avgRating: Number(sitter.avg_rating ?? 0),
    earningTotal: Number(sitter.earning_total ?? 0),
    services: activeServices,
    documents,
    stats: {
      serviceCount: countActiveServices(sitter),
      documentCount: documents.length,
      verificationCompletion: Math.round((documents.length / 3) * 100),
      profileCompleteness: Number(Boolean(sitter.bio) + Boolean(sitter.address) + Boolean(sitter.service_area) + Boolean(sitter.professional_title)) * 25,
    },
  };

  return serialize(profile);
}