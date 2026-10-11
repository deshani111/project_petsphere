import { prisma } from "../../../lib/prisma";
import { getCurrentSitter } from "../sitter.service";
import { saveVerificationFile } from "../verification-documents";
import { normalizeProfileInput, validateProfileInput } from "./profile.validation";
import { toSitterProfileDTO } from "./profile.dto";

async function loadSitterRecord(sitterId) {
  return prisma.pet_sitter.findUnique({
    where: { sitter_id: sitterId },
    include: {
      users: true,
      pet_sitter_service: { include: { service_type: true } },
      verification_documents: true,
    },
  });
}

export async function getCurrentSitterProfile() {
  const sitter = await getCurrentSitter();
  if (!sitter) return null;

  const record = await loadSitterRecord(sitter.sitter_id);
  return record ? toSitterProfileDTO(record) : null;
}

export async function updateCurrentSitterProfile(body, files = []) {
  const sitter = await getCurrentSitter();
  if (!sitter) return { error: "Sitter access is required.", status: 401 };

  const record = await loadSitterRecord(sitter.sitter_id);
  if (!record) return { error: "Sitter profile was not found.", status: 404 };

  const input = normalizeProfileInput(body, record);
  const validationMessage = validateProfileInput(input);
  if (validationMessage) return { error: validationMessage, status: 400 };

  try {
    const storedDocuments = [];
    for (const [type, file] of files) {
      storedDocuments.push({ type, url: await saveVerificationFile({ sitterId: record.sitter_id, type, file }) });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const profileData = {};

      if (input.profileFieldsPresent) {
        await tx.users.update({
          where: { user_id: record.user_id },
          data: {
            first_name: input.firstName,
            last_name: input.lastName,
            email: input.email,
            phone_number: input.phone || null,
          },
        });

        profileData.address = input.address || null;
        profileData.service_area = input.serviceArea;
        profileData.bio = input.bio || null;
        profileData.professional_title = input.professionalTitle;
      }

      if (input.notificationsEnabled !== null) {
        profileData.notifications_enabled = input.notificationsEnabled;
      }

      if (storedDocuments.length > 0) {
        for (const document of storedDocuments) {
          await tx.sitter_verification_document.upsert({
            where: {
              sitter_id_document_type: {
                sitter_id: record.sitter_id,
                document_type: document.type,
              },
            },
            update: {
              file_url: document.url,
              submitted_at: new Date(),
              reviewed_at: null,
            },
            create: {
              sitter_id: record.sitter_id,
              document_type: document.type,
              file_url: document.url,
            },
          });
        }
      }

      if (Object.keys(profileData).length > 0) {
        await tx.pet_sitter.update({
          where: { sitter_id: record.sitter_id },
          data: profileData,
        });
      }

      return tx.pet_sitter.findUnique({
        where: { sitter_id: record.sitter_id },
        include: {
          users: true,
          pet_sitter_service: { include: { service_type: true } },
          verification_documents: true,
        },
      });
    });

    return { profile: updated ? toSitterProfileDTO(updated) : null };
  } catch (error) {
    return {
      error: error?.code === "P2002" ? "That email address is already in use." : error?.message || "Unable to save your profile.",
      status: error?.code === "P2002" ? 409 : 500,
    };
  }
}