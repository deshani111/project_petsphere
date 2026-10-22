import { prisma } from "../../lib/prisma";

export const AD_STATUSES = ["pending", "approved", "rejected"];

const LOCATION_MARKER = "\n\nLocation: ";
const PET_DETAILS_MARKER = "\n\nPet details:\n";
const SENSITIVE_AD_FIELDS = ["images", "petType", "petName", "description"];

const publicAdSelect = {
  ad_id: true,
  title: true,
  pet_name: true,
  pet_type: true,
  breed: true,
  description: true,
  price: true,
  photo_url: true,
  photos: { orderBy: { sort_order: "asc" }, select: { photo_url: true } },
  created_date: true,
};

const listingSelect = {
  ad_id: true,
  owner_id: true,
  sitter_id: true,
  title: true,
  description: true,
  price: true,
  photo_url: true,
  status: true,
  rejection_reason: true,
  created_date: true,
  pet_type: true,
  pet_name: true,
  breed: true,
  age: true,
  gender: true,
  vaccinated: true,
  microchipped: true,
  house_trained: true,
  good_with_children: true,
  good_with_other_pets: true,
  special_care_needed: true,
  photos: { orderBy: { sort_order: "asc" }, select: { photo_url: true } },
};

const adminAdSelect = {
  ...listingSelect,
  pet_owner: { select: { users: { select: { first_name: true, last_name: true } } } },
  pet_sitter: { select: { users: { select: { first_name: true, last_name: true } } } },
};

const detailAdSelect = {
  ...listingSelect,
  pet_owner: {
    select: {
      users: {
        select: {
          first_name: true,
          last_name: true,
          full_name: true,
          phone_number: true,
          email: true,
        },
      },
    },
  },
  pet_sitter: {
    select: {
      users: {
        select: {
          first_name: true,
          last_name: true,
          full_name: true,
          phone_number: true,
          email: true,
        },
      },
    },
  },
};

function parseId(value) {
  return typeof value === "string" && /^\d+$/.test(value) ? BigInt(value) : null;
}

function capitalizeFirstLetter(value) {
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;
}

function splitListingDescription(description = "") {
  const markerIndex = description.lastIndexOf(LOCATION_MARKER);
  const listingText = markerIndex === -1 ? description : description.slice(0, markerIndex);
  const detailsIndex = listingText.lastIndexOf(PET_DETAILS_MARKER);
  const petDetails = {};

  if (detailsIndex !== -1) {
    listingText.slice(detailsIndex + PET_DETAILS_MARKER.length).split("\n").forEach((line) => {
      const [label, ...value] = line.split(": ");
      if (label && value.length) petDetails[label.toLowerCase()] = value.join(": ");
    });
  }

  return {
    description: detailsIndex === -1 ? listingText : listingText.slice(0, detailsIndex),
    location: markerIndex === -1 ? null : description.slice(markerIndex + LOCATION_MARKER.length) || null,
    petDetails,
  };
}

function formatCare(ad) {
  return {
    vaccinated: ad.vaccinated,
    microchipped: ad.microchipped,
    houseTrained: ad.house_trained,
    goodWithChildren: ad.good_with_children,
    goodWithOtherPets: ad.good_with_other_pets,
    specialCareNeeded: ad.special_care_needed,
  };
}

function formatImages(ad) {
  return ad.photos?.map((photo) => photo.photo_url) ?? [];
}

export function serializePublicListing(ad) {
  const details = splitListingDescription(ad.description);
  return {
    id: ad.ad_id.toString(),
    title: ad.title,
    petName: ad.pet_name,
    petType: ad.pet_type,
    breed: ad.breed,
    description: details.description,
    location: details.location,
    petDetails: details.petDetails,
    price: ad.price?.toString() ?? null,
    image: ad.photo_url,
    images: formatImages(ad),
    createdAt: ad.created_date,
  };
}

export function serializeSellerListing(ad) {
  return {
    id: ad.ad_id.toString(),
    title: ad.title,
    description: ad.description,
    price: ad.price?.toString() ?? null,
    image: ad.photo_url,
    images: formatImages(ad),
    petName: ad.pet_name,
    petType: ad.pet_type,
    breed: ad.breed,
    age: ad.age,
    gender: ad.gender,
    status: ad.status,
    rejectionReason: ad.rejection_reason,
    createdAt: ad.created_date,
  };
}

export function serializeAdminListing(ad, includePetDetails = false) {
  const seller = ad.pet_owner?.users || ad.pet_sitter?.users;
  return {
    id: ad.ad_id.toString(),
    title: ad.title,
    ...(includePetDetails ? {
      petName: ad.pet_name,
      petType: ad.pet_type,
      breed: ad.breed,
      age: ad.age,
      gender: ad.gender,
      care: formatCare(ad),
      images: formatImages(ad),
    } : {}),
    description: ad.description,
    price: ad.price?.toString() ?? null,
    image: ad.photo_url,
    status: ad.status,
    rejectionReason: ad.rejection_reason,
    createdAt: ad.created_date,
    seller: seller ? `${seller.first_name} ${seller.last_name}`.trim() : "Unknown seller",
    sellerRole: ad.pet_sitter ? "pet_sitter" : "pet_owner",
  };
}

export function serializeListingDetail(ad, includeOwner = true) {
  const seller = ad.pet_owner?.users || ad.pet_sitter?.users;
  return {
    id: ad.ad_id.toString(),
    title: ad.title,
    description: ad.description,
    price: ad.price?.toString() ?? null,
    image: ad.photo_url,
    status: ad.status,
    rejectionReason: ad.rejection_reason,
    createdAt: ad.created_date,
    petType: ad.pet_type,
    petName: ad.pet_name,
    breed: ad.breed,
    age: ad.age,
    gender: ad.gender,
    care: formatCare(ad),
    images: formatImages(ad),
    postedAt: ad.created_date,
    ...(includeOwner ? {
      owner: seller ? {
        name: seller.full_name || `${seller.first_name} ${seller.last_name}`.trim(),
        phone: seller.phone_number,
        email: seller.email,
      } : null,
    } : {}),
  };
}

function sellerWhere(seller) {
  return seller.role === "pet_owner" ? { owner_id: seller.ownerId } : { sitter_id: seller.sitterId };
}

export function normalizeListingInput(input) {
  const description = typeof input.description === "string" ? input.description.trim().slice(0, 4000) : "";
  const type = capitalizeFirstLetter(typeof input.type === "string" ? input.type.trim().slice(0, 50) : "");
  const name = capitalizeFirstLetter(typeof input.name === "string" ? input.name.trim().slice(0, 100) : "");
  const breed = capitalizeFirstLetter(typeof input.breed === "string" ? input.breed.trim().slice(0, 100) : "");
  const age = typeof input.age === "string" ? input.age.trim().slice(0, 50) : "";
  const gender = typeof input.gender === "string" ? input.gender.trim().toLowerCase() : "";
  const location = capitalizeFirstLetter(typeof input.location === "string" ? input.location.trim().slice(0, 120) : "");
  const priceValue = typeof input.price === "string" ? input.price.trim() : "";
  const price = priceValue ? Number(priceValue) : null;

  return { description, type, name, breed, age, gender, location, priceValue, price };
}

export function validateNewListing(input) {
  const values = normalizeListingInput(input);
  if (!values.name || !values.description || !values.location) {
    return { error: "Add the pet name, description, and location." };
  }
  if (!values.type || !values.breed || !values.age || !["male", "female"].includes(values.gender)) {
    return { error: "Complete the pet details before submitting your ad." };
  }
  if (!/^\d+(\.\d+)?$/.test(values.age) || Number(values.age) < 0) {
    return { error: "Age must be a valid number." };
  }
  if (values.name.length < 2 || values.description.length < 20) {
    return { error: "Please provide a valid pet name and a little more detail for your listing." };
  }
  if (values.priceValue && (!Number.isFinite(values.price) || values.price < 0)) {
    return { error: "Enter a valid listing price." };
  }
  return { values };
}

export async function getPublicListings() {
  const advertisements = await prisma.advertisement.findMany({
    where: { status: "approved" },
    orderBy: { created_date: "desc" },
    take: 60,
    select: publicAdSelect,
  });
  return advertisements.map(serializePublicListing);
}

export async function getListingById(id, { includeUnpublished = false } = {}) {
  const adId = parseId(id);
  if (!adId) return null;
  const ad = await prisma.advertisement.findUnique({ where: { ad_id: adId }, select: detailAdSelect });
  if (!ad || (!includeUnpublished && ad.status !== "approved")) return null;
  return ad;
}

export async function getSellerListings(seller) {
  const ads = await prisma.advertisement.findMany({
    where: sellerWhere(seller),
    orderBy: { created_date: "desc" },
    select: listingSelect,
  });
  return ads.map(serializeSellerListing);
}

export async function getSellerListing(id, seller) {
  const adId = parseId(id);
  if (!adId) return null;
  return prisma.advertisement.findFirst({
    where: { ad_id: adId, ...sellerWhere(seller) },
    select: listingSelect,
  });
}

export async function createListing({ seller, values, photoUrls, care }) {
  const locationDescription = `${values.description}${LOCATION_MARKER}${values.location}`;
  const advertisement = await prisma.advertisement.create({
    data: {
      owner_id: seller.ownerId,
      sitter_id: seller.sitterId,
      title: values.name,
      description: locationDescription,
      price: values.price,
      photo_url: photoUrls[0]?.url ?? null,
      pet_type: values.type,
      pet_name: values.name,
      breed: values.breed,
      age: values.age,
      gender: values.gender,
      vaccinated: Boolean(care.vaccinated),
      microchipped: Boolean(care.microchipped),
      house_trained: Boolean(care.houseTrained),
      good_with_children: Boolean(care.goodWithChildren),
      good_with_other_pets: Boolean(care.goodWithOtherPets),
      special_care_needed: Boolean(care.specialCareNeeded),
      status: "pending",
      photos: { create: photoUrls.map(({ url, sortOrder }) => ({ photo_url: url, sort_order: sortOrder })) },
    },
    select: { ad_id: true, status: true },
  });
  return { adId: advertisement.ad_id.toString(), status: advertisement.status };
}

function descriptionChangeRatio(original, next) {
  const changedCharacters = Math.max(original.length, next.length) - [...original].reduce(
    (unchanged, character, index) => unchanged + (character === next[index] ? 1 : 0),
    0,
  );
  return original.length ? changedCharacters / original.length : next.length ? 1 : 0;
}

export function prepareListingUpdate(body, existing) {
  const descriptionWasSent = Object.prototype.hasOwnProperty.call(body, "description");
  const priceWasSent = Object.prototype.hasOwnProperty.call(body, "price");
  const description = descriptionWasSent && typeof body.description === "string" ? body.description.trim().slice(0, 4000) : (existing.description || "");
  const priceValue = priceWasSent && typeof body.price === "string" ? body.price.trim() : null;
  const price = priceWasSent ? (priceValue ? Number(priceValue) : null) : existing.price;
  const petFieldsSent = ["type", "name", "breed", "age", "gender"].some((field) => Object.prototype.hasOwnProperty.call(body, field));
  const petType = petFieldsSent && typeof body.type === "string" ? capitalizeFirstLetter(body.type.trim().slice(0, 50)) : existing.pet_type;
  const petName = petFieldsSent && typeof body.name === "string" ? capitalizeFirstLetter(body.name.trim().slice(0, 100)) : existing.pet_name;
  const breed = petFieldsSent && typeof body.breed === "string" ? capitalizeFirstLetter(body.breed.trim().slice(0, 100)) : existing.breed;
  const age = petFieldsSent && typeof body.age === "string" ? body.age.trim().slice(0, 50) : existing.age;
  const gender = petFieldsSent && typeof body.gender === "string" ? body.gender.trim().toLowerCase() : existing.gender;
  const title = petFieldsSent ? petName : (existing.pet_name || existing.title);

  if (!title || title.length < 2 || description.length < 20) {
    return { error: "Add a valid pet name and a little more description." };
  }
  if (priceValue && (!Number.isFinite(price) || price < 0)) {
    return { error: "Enter a valid listing price." };
  }
  if (petFieldsSent && (!petType || !petName || !breed || !age || !["male", "female"].includes(gender) || !/^\d+(\.\d+)?$/.test(age) || Number(age) < 0)) {
    return { error: "Complete the pet details with a valid age and gender." };
  }

  const imageWasSent = Object.prototype.hasOwnProperty.call(body, "images") || Object.prototype.hasOwnProperty.call(body, "image");
  const imageValue = body.images ?? body.image;
  const incomingImage = typeof imageValue === "string"
    ? imageValue.trim()
    : Array.isArray(imageValue) && typeof imageValue[0] === "string" ? imageValue[0].trim() : null;
  const descriptionChanged = descriptionWasSent && description !== (existing.description || "");
  const changedSensitiveFields = [];
  for (const field of SENSITIVE_AD_FIELDS) {
    if (field === "images" && imageWasSent && incomingImage !== (existing.photo_url || "")) changedSensitiveFields.push(field);
    if (field === "petName" && petFieldsSent && petName !== existing.pet_name) changedSensitiveFields.push(field);
    if (field === "description" && descriptionChanged && descriptionChangeRatio(existing.description || "", description) > 0.3) changedSensitiveFields.push(field);
  }

  const requiresReview = existing.status === "approved"
    ? changedSensitiveFields.length > 0
    : existing.status === "rejected";
  return {
    values: { description, price, petFieldsSent, petType, petName, breed, age, gender, title, imageWasSent, incomingImage },
    requiresReview,
    changedSensitiveFields,
  };
}

export async function updateSellerListing(id, seller, body) {
  const existing = await getSellerListing(id, seller);
  if (!existing) return null;
  const prepared = prepareListingUpdate(body, existing);
  if (prepared.error) return prepared;
  const { values, requiresReview, changedSensitiveFields } = prepared;
  const nextStatus = existing.status === "approved" && !requiresReview ? "approved" : "pending";
  const updated = await prisma.advertisement.update({
    where: { ad_id: existing.ad_id },
    data: {
      title: values.title,
      description: values.description,
      price: values.price,
      ...(values.imageWasSent ? { photo_url: values.incomingImage || null } : {}),
      ...(values.petFieldsSent ? {
        pet_type: values.petType,
        pet_name: values.petName,
        breed: values.breed,
        age: values.age,
        gender: values.gender,
        vaccinated: Boolean(body.care?.vaccinated),
        microchipped: Boolean(body.care?.microchipped),
        house_trained: Boolean(body.care?.houseTrained),
        good_with_children: Boolean(body.care?.goodWithChildren),
        good_with_other_pets: Boolean(body.care?.goodWithOtherPets),
        special_care_needed: Boolean(body.care?.specialCareNeeded),
      } : {}),
      status: nextStatus,
      ...(requiresReview || existing.status === "rejected"
        ? { rejection_reason: null, reviewed_by: null, reviewed_at: null }
        : {}),
    },
    select: { ad_id: true, title: true, description: true, price: true, photo_url: true, status: true, rejection_reason: true, created_date: true },
  });
  return {
    message: requiresReview ? "Your changes were submitted for review." : "Your ad was updated.",
    ad: {
      id: updated.ad_id.toString(),
      title: updated.title,
      description: updated.description,
      price: updated.price?.toString() ?? null,
      image: updated.photo_url,
      status: updated.status,
      rejectionReason: updated.rejection_reason,
      createdAt: updated.created_date,
    },
    requiresReview,
    changedSensitiveFields,
  };
}

export async function getAdminListings(status) {
  const ads = await prisma.advertisement.findMany({
    where: status === "all" ? undefined : { status },
    orderBy: { created_date: "desc" },
    select: adminAdSelect,
  });
  return ads.map((ad) => serializeAdminListing(ad, false));
}

export async function getAdminApprovalListings(status) {
  const ads = await prisma.advertisement.findMany({
    where: { status },
    orderBy: { created_date: "asc" },
    select: adminAdSelect,
  });
  return ads.map((ad) => serializeAdminListing(ad, true));
}

export async function moderateListing(id, adminId, decision, reason = "") {
  const adId = parseId(id);
  if (!adId) return { error: "Invalid ad.", status: 400 };
  const nextStatus = decision === "approve" ? "approved" : decision === "reject" ? "rejected" : null;
  if (!nextStatus) return { error: "Provide a valid ad and moderation decision.", status: 400 };
  const rejectionReason = reason.trim().slice(0, 1000);
  if (nextStatus === "rejected" && !rejectionReason) return { error: "A rejection reason is required.", status: 400 };

  const result = await prisma.advertisement.updateMany({
    where: { ad_id: adId, status: "pending" },
    data: {
      status: nextStatus,
      rejection_reason: nextStatus === "rejected" ? rejectionReason : null,
      reviewed_by: BigInt(adminId),
      reviewed_at: new Date(),
    },
  });
  if (result.count !== 1) return { error: "Ad was not found or was already reviewed.", status: 404 };
  return { status: nextStatus };
}

export { parseId, sellerWhere };
