import { redirect } from "next/navigation";
import AdminDashboardClient from "../dashboard/dashboard-client";
import ProfileClient from "../profile/profile-client";
import styles from "./page.module.css";

const previewData = {
  totalPetOwners: 12000,
  totalPetSitters: 482,
  pendingSitterVerifications: 28,
  totalBookings: 843,
  revenue: [
    { amount: 2500, date: "2026-01-01T00:00:00.000Z" },
    { amount: 4200, date: "2026-02-01T00:00:00.000Z" },
    { amount: 6800, date: "2026-03-01T00:00:00.000Z" },
    { amount: 9100, date: "2026-04-01T00:00:00.000Z" },
    { amount: 10800, date: "2026-05-01T00:00:00.000Z" },
    { amount: 8750, date: "2026-06-01T00:00:00.000Z" },
  ],
  bookingsByService: [
    { name: "Dog Walking", bookings: 45 },
    { name: "Pet Sitting", bookings: 30 },
    { name: "Grooming", bookings: 15 },
    { name: "Boarding", bookings: 10 },
  ],
  recentUsers: [
    { id: "preview-owner", fullName: "Preview Owner", email: "owner@example.test", role: "pet_owner", createdAt: "2026-03-01T00:00:00.000Z" },
    { id: "preview-sitter", fullName: "Preview Sitter", email: "sitter@example.test", role: "pet_sitter", createdAt: "2026-03-02T00:00:00.000Z" },
  ],
};

const profilePreviewData = {
  profile: {
    fullName: "chathurya Jayasinghe",
    email: "admin@petsphere.lk",
    initials: "CJ",
    roleLabel: "System Administrator",
    location: "Not available",
    locationLabel: "Not available",
    staffId: "#PS-0007-CJ",
    lastLogin: "4 hours ago",
    badges: ["SUPER ADMIN", "VERIFIED"],
    isVerified: true,
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  personalInfo: {
    fullName: "chathurya Jayasinghe",
    email: "admin@petsphere.lk",
    adminRole: "System Administrator",
    staffId: "#PS-0007-CJ",
    location: "Not available",
    isEmailEditable: false,
    createdAt: "2026-08-11T00:00:00.000Z",
  },
  platformStatus: {
    systemLabel: "All systems operational",
    pendingAudits: 6,
    pendingLabel: "6 reports to review",
    totalBookings: 128,
    totalReviews: 42,
    totalPayments: 18,
  },
  activities: [
    {
      tone: "warm",
      title: "Approved new user registration",
      detail: "Sandi joined as a pet sitter account.",
      time: "5 hours ago",
    },
    {
      tone: "green",
      title: "Updated booking activity",
      detail: "Pet Boarding booking for Buddy was added to the queue.",
      time: "3 days ago",
    },
    {
      tone: "alert",
      title: "Moderated recent feedback",
      detail: "Received a 1/5 review for Sandini j.",
      time: "10 hours ago",
    },
  ],
};

export default function AdminDashboardPreviewPage({ searchParams }) {
  if (process.env.NODE_ENV !== "development") {
    redirect("/login");
  }

  if (searchParams?.view === "profile") {
    return (
      <>
        <p className={styles.previewLabel}>Development Preview — profile mock data only</p>
        <ProfileClient data={profilePreviewData} />
      </>
    );
  }

  return (
    <>
      <p className={styles.previewLabel}>Development Preview — mock data only</p>
      <AdminDashboardClient previewData={previewData} />
    </>
  );
}
