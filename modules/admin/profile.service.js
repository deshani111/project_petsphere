import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRelativeTime(value) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

function formatName(user) {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.fullName || "Sarah Jenkins";
}

function splitFullName(fullName) {
  const trimmed = String(fullName || "").trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ").filter(Boolean);
  if (!parts.length) {
    return { firstName: "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ") || parts[0],
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function loadAdminUser(account) {
  if (!account?.id) {
    return null;
  }

  const userId = BigInt(account.id);

  return prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      full_name: true,
      email: true,
      role: true,
      is_verified: true,
      updated_at: true,
      created_at: true,
      admin: {
        select: {
          admin_id: true,
        },
      },
    },
  });
}

async function loadRecentActivities() {
  const [latestUser, latestBooking, latestReview, pendingBookCount, pendingPaymentCount] = await Promise.all([
    prisma.users.findFirst({
      where: { role: { not: "admin" } },
      orderBy: { created_at: "desc" },
      select: {
        first_name: true,
        last_name: true,
        full_name: true,
        role: true,
        created_at: true,
      },
    }),
    prisma.booking.findFirst({
      orderBy: { created_at: "desc" },
      include: {
        service_type: { select: { name: true } },
        pet: { select: { pet_name: true } },
      },
    }),
    prisma.review.findFirst({
      orderBy: { review_date: "desc" },
      include: {
        pet_sitter: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                full_name: true,
              },
            },
          },
        },
      },
    }),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.payment.count({ where: { status: "pending" } }),
  ]);

  const activities = [];

  if (latestUser) {
    activities.push({
      tone: "warm",
      title: "Approved new user registration",
      detail: `${formatName({
        firstName: latestUser.first_name,
        lastName: latestUser.last_name,
        fullName: latestUser.full_name,
      })} joined as a ${String(latestUser.role || "").replace(/_/g, " ")} account.`,
      time: formatRelativeTime(latestUser.created_at),
    });
  }

  if (latestBooking) {
    activities.push({
      tone: "green",
      title: "Updated booking activity",
      detail: `${latestBooking.service_type?.name || "Service"} booking for ${latestBooking.pet?.pet_name || "a pet"} was added to the queue.`,
      time: formatRelativeTime(latestBooking.created_at),
    });
  }

  if (latestReview) {
    const sitterName = formatName({
      firstName: latestReview.pet_sitter?.users?.first_name,
      lastName: latestReview.pet_sitter?.users?.last_name,
      fullName: latestReview.pet_sitter?.users?.full_name,
    });

    activities.push({
      tone: "alert",
      title: "Moderated recent feedback",
      detail: `Received a ${latestReview.rating}/5 review for ${sitterName}.`,
      time: formatRelativeTime(latestReview.review_date),
    });
  }

  return {
    pendingAudits: pendingBookCount + pendingPaymentCount,
    activities,
  };
}

export async function getAdminProfileData(account) {
  const adminUser = await loadAdminUser(account);
  const [totalBookings, totalReviews, totalPayments, recent] = await Promise.all([
    prisma.booking.count(),
    prisma.review.count(),
    prisma.payment.count(),
    loadRecentActivities(),
  ]);

  const fullName = formatName({
    firstName: adminUser?.first_name || account?.firstName,
    lastName: adminUser?.last_name || account?.lastName,
    fullName: adminUser?.full_name || account?.fullName,
  });
  const roleLabel = "System Administrator";
  const initialsValue = initials(fullName) || "SJ";
  const staffSeed = adminUser?.user_id ? String(adminUser.user_id).padStart(4, "0") : account?.id ? String(account.id).padStart(4, "0") : "8842";
  const email = adminUser?.email || account?.email || "admin@petsphere.com";
  const location = "Not available";

  return {
    profile: {
      fullName,
      roleLabel,
      email,
      createdAt: adminUser?.created_at || account?.createdAt || null,
      staffId: `#PS-${staffSeed}-${initialsValue}`,
      initials: initialsValue,
      avatarTone: "admin",
      lastLogin: adminUser?.updated_at ? formatRelativeTime(adminUser.updated_at) : "Recently",
      location,
      locationLabel: location,
      badges: ["SUPER ADMIN", "VERIFIED"],
      isVerified: Boolean(adminUser?.is_verified ?? account?.isVerified),
      userId: adminUser?.user_id?.toString() || account?.id || "",
    },
    personalInfo: {
      fullName,
      email,
      adminRole: roleLabel,
      staffId: `#PS-${staffSeed}-${initialsValue}`,
      location,
      isEmailEditable: false,
      createdAt: adminUser?.created_at || account?.createdAt || null,
    },
    platformStatus: {
      systemLabel: "All systems operational",
      pendingAudits: recent.pendingAudits,
      pendingLabel: `${recent.pendingAudits} reports to review`,
      totalBookings,
      totalReviews,
      totalPayments,
    },
    activities: recent.activities,
  };
}

export async function updateAdminProfile(account, input = {}) {
  const adminUser = await loadAdminUser(account);

  if (!adminUser?.admin) {
    throw new Error("Admin profile could not be located.");
  }

  const fullName = String(input.fullName || "").trim().replace(/\s+/g, " ");
  const normalizedEmail = normalizeEmail(input.email || adminUser.email);

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (normalizedEmail !== normalizeEmail(adminUser.email)) {
    throw new Error("Email changes are not supported for this profile.");
  }

  const { firstName, lastName } = splitFullName(fullName);

  await prisma.users.update({
    where: { user_id: adminUser.user_id },
    data: {
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date(),
    },
  });

  return getAdminProfileData({
    ...account,
    fullName,
    email: adminUser.email,
  });
}

function passwordPolicySatisfied(value) {
  return (
    typeof value === "string" &&
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

export async function changeAdminPassword(account, input = {}) {
  const adminUser = await loadAdminUser(account);

  if (!adminUser?.admin) {
    throw new Error("Admin profile could not be located.");
  }

  const currentPassword = String(input.currentPassword || "");
  const newPassword = String(input.newPassword || "");

  if (!currentPassword) {
    throw new Error("Current password is required.");
  }

  if (!passwordPolicySatisfied(newPassword)) {
    throw new Error("The new password does not meet the required policy.");
  }

  const authUser = await prisma.users.findUnique({
    where: { user_id: adminUser.user_id },
    select: { password_hash: true },
  });

  const passwordMatches = await bcrypt.compare(currentPassword, authUser?.password_hash || "");

  if (!passwordMatches) {
    throw new Error("The current password is incorrect.");
  }

  if (currentPassword === newPassword) {
    throw new Error("The new password must be different from the current password.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.users.update({
    where: { user_id: adminUser.user_id },
    data: {
      password_hash: passwordHash,
      updated_at: new Date(),
    },
  });
}
