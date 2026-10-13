import { prisma } from "../lib/prisma.js";

const SERVICE_TYPES = [
  { name: "Pet Boarding", description: "Overnight boarding and stay care." },
  { name: "Dog Walking", description: "Short and extended neighborhood walks." },
  { name: "Grooming Session", description: "Bathing, brushing, and coat care." },
  { name: "Overnight Care", description: "One-night home care for pets." },
  { name: "Drop-in Visit", description: "Quick visits for feeding and check-ins." },
  { name: "Training Session", description: "Behavior and obedience training." },
  { name: "Pet Sitting", description: "Daytime sitting and companionship." },
  { name: "Cat Boarding", description: "Boarding for feline companions." },
];

const SEED_ROWS = [
  { ownerIndex: 0, sitterIndex: 0, serviceType: "Pet Boarding", petName: "Buddy", amount: 145.0, status: "completed", dayOffset: 2, hasEndDate: true },
  { ownerIndex: 1, sitterIndex: 1, serviceType: "Dog Walking", petName: "Luna", amount: 85.0, status: "pending", dayOffset: 4, hasEndDate: false },
  { ownerIndex: 2, sitterIndex: 0, serviceType: "Grooming Session", petName: "Max", amount: 60.0, status: "completed", dayOffset: 5, hasEndDate: false },
  { ownerIndex: 3, sitterIndex: 1, serviceType: "Overnight Care", petName: "Bella", amount: 250.0, status: "completed", dayOffset: 7, hasEndDate: true },
  { ownerIndex: 4, sitterIndex: 0, serviceType: "Drop-in Visit", petName: "Coco", amount: 45.0, status: "refunded", dayOffset: 9, hasEndDate: false },
  { ownerIndex: 5, sitterIndex: 1, serviceType: "Training Session", petName: "Shadow", amount: 320.0, status: "completed", dayOffset: 11, hasEndDate: false },
  { ownerIndex: 0, sitterIndex: 0, serviceType: "Pet Sitting", petName: "Buddy", amount: 120.0, status: "completed", dayOffset: 13, hasEndDate: false },
  { ownerIndex: 1, sitterIndex: 1, serviceType: "Cat Boarding", petName: "Luna", amount: 90.0, status: "pending", dayOffset: 14, hasEndDate: true },
  { ownerIndex: 2, sitterIndex: 0, serviceType: "Dog Walking", petName: "Max", amount: 75.0, status: "completed", dayOffset: 18, hasEndDate: false },
  { ownerIndex: 3, sitterIndex: 1, serviceType: "Grooming Session", petName: "Bella", amount: 110.0, status: "completed", dayOffset: 20, hasEndDate: false },
  { ownerIndex: 4, sitterIndex: 0, serviceType: "Drop-in Visit", petName: "Coco", amount: 95.0, status: "pending", dayOffset: 23, hasEndDate: false },
  { ownerIndex: 5, sitterIndex: 1, serviceType: "Pet Boarding", petName: "Shadow", amount: 200.0, status: "completed", dayOffset: 27, hasEndDate: true },
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function ensureServiceTypes() {
  for (const service of SERVICE_TYPES) {
    const existing = await prisma.service_type.findFirst({
      where: { name: service.name },
      select: { service_type_id: true },
    });

    if (!existing) {
      await prisma.service_type.create({ data: service });
      console.log(`Seeded service type: ${service.name}`);
    }
  }
}

async function ensurePets(owners) {
  const petTemplates = [
    { pet_name: "Buddy", species: "Dog", breed: "Golden Retriever", gender: null, age: 3, photo: "/marketplace-cooper.jpg" },
    { pet_name: "Luna", species: "Dog", breed: "Siberian Husky", gender: null, age: 2, photo: "/marketplace-luna.jpg" },
    { pet_name: "Max", species: "Dog", breed: "Labrador Mix", gender: null, age: 4, photo: "/blog-featured-puppy.jpg" },
    { pet_name: "Bella", species: "Dog", breed: "French Bulldog", gender: null, age: 1, photo: "/blog-training.jpg" },
    { pet_name: "Coco", species: "Cat", breed: "Bengal Mix", gender: null, age: 2, photo: "/blog-cat-behavior.jpg" },
    { pet_name: "Shadow", species: "Dog", breed: "Border Collie", gender: null, age: 5, photo: "/marketplace-snow.jpg" },
  ];

  for (let index = 0; index < owners.length; index += 1) {
    const owner = owners[index];
    const existingPet = await prisma.pet.findFirst({
      where: { owner_id: owner.owner_id },
      select: { pet_id: true },
    });

    if (existingPet) {
      continue;
    }

    const pet = petTemplates[index % petTemplates.length];
    await prisma.pet.create({
      data: {
        owner_id: owner.owner_id,
        pet_name: pet.pet_name,
        species: pet.species,
        breed: pet.breed,
        gender: pet.gender,
        age: pet.age,
        photo: pet.photo,
        medical_notes: "Seeded development pet profile.",
      },
    });

    console.log(`Seeded pet for owner ${owner.userName}: ${pet.pet_name}`);
  }
}

async function seedEarnings() {
  const existingPayments = await prisma.payment.count();
  const existingBookings = await prisma.booking.count();

  if (existingPayments > 0 || existingBookings > 0) {
    console.log("Earnings seed skipped because bookings or payments already exist.");
    return;
  }

  await ensureServiceTypes();

  const owners = await prisma.pet_owner.findMany({
    orderBy: { owner_id: "asc" },
    select: {
      owner_id: true,
      users: {
        select: {
          first_name: true,
          last_name: true,
          full_name: true,
        },
      },
    },
  });

  const sitters = await prisma.pet_sitter.findMany({
    orderBy: { sitter_id: "asc" },
    select: {
      sitter_id: true,
      users: {
        select: {
          first_name: true,
          last_name: true,
          full_name: true,
        },
      },
    },
  });

  if (!owners.length || !sitters.length) {
    throw new Error("At least one pet owner and one pet sitter are required to seed earnings data.");
  }

  await ensurePets(
    owners.map((owner) => ({
      owner_id: owner.owner_id,
      userName: `${owner.users.first_name || ""} ${owner.users.last_name || ""}`.trim() || owner.users.full_name || "Owner",
    }))
  );

  const serviceTypes = await prisma.service_type.findMany({
    orderBy: { service_type_id: "asc" },
    select: { service_type_id: true, name: true },
  });

  const pets = await prisma.pet.findMany({
    orderBy: { pet_id: "asc" },
    select: { pet_id: true, owner_id: true, pet_name: true },
  });

  const petByOwner = new Map();
  pets.forEach((pet) => {
    if (!petByOwner.has(pet.owner_id.toString())) {
      petByOwner.set(pet.owner_id.toString(), pet);
    }
  });

  const serviceTypeByName = new Map(serviceTypes.map((service) => [service.name, service]));

  for (let index = 0; index < SEED_ROWS.length; index += 1) {
    const row = SEED_ROWS[index];
    const owner = owners[row.ownerIndex % owners.length];
    const sitter = sitters[row.sitterIndex % sitters.length];
    const serviceType = serviceTypeByName.get(row.serviceType);
    const pet = petByOwner.get(owner.owner_id.toString());

    if (!serviceType || !pet) {
      continue;
    }

    const date = daysAgo(row.dayOffset);
    const booking = await prisma.booking.create({
      data: {
        owner_id: owner.owner_id,
        sitter_id: sitter.sitter_id,
        pet_id: pet.pet_id,
        service_type_id: serviceType.service_type_id,
        start_date: date,
        end_date: row.hasEndDate ? daysAgo(row.dayOffset - 2) : null,
        status: row.status === "pending" ? "pending" : row.status === "refunded" ? "cancelled" : "completed",
        total_amount: row.amount,
        notes: `Seed booking for ${row.serviceType}.`,
        booking_date: date,
        created_at: date,
      },
    });

    await prisma.payment.create({
      data: {
        booking_id: booking.booking_id,
        amount: row.amount,
        payment_method: index % 2 === 0 ? "Card" : "Wallet",
        transaction_ref: `TXN-${String(index + 1).padStart(6, "0")}`,
        invoice_number: `INV-${String(index + 1).padStart(5, "0")}`,
        status: row.status,
        payment_date: date,
      },
    });
  }

  console.log("Seeded earnings demo data.");
}

seedEarnings()
  .catch((error) => {
    console.error("Earnings seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
