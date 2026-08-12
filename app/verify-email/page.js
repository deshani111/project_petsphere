import Link from "next/link";
import styles from "./page.module.css";

const STATUS_COPY = {
  success: {
    eyebrow: "Verified",
    title: "Email verified successfully!",
    message: "You can now log in to your PetSphere account.",
    tone: "success",
  },
  invalid: {
    eyebrow: "Invalid link",
    title: "This verification link is invalid.",
    message: "Please request a new verification email from the login page.",
    tone: "error",
  },
  expired: {
    eyebrow: "Link expired",
    title: "This verification link has expired.",
    message: "Request a fresh verification email to continue.",
    tone: "warning",
  },
  "already-verified": {
    eyebrow: "Already verified",
    title: "Your email has already been verified.",
    message: "You can log in to your PetSphere account now.",
    tone: "success",
  },
  "missing-token": {
    eyebrow: "Missing token",
    title: "This verification link is invalid.",
    message: "Please request a new verification email from the login page.",
    tone: "error",
  },
};

export default async function VerifyEmailPage({ searchParams }) {
  const params = await searchParams;

  const status =
    typeof params?.status === "string" ? params.status : "invalid";

  const copy = STATUS_COPY[status] || STATUS_COPY.invalid;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>PS</div>
          <span className={styles.brandName}>PetSphere</span>
          <div className={`${styles.statusBadge} ${styles[copy.tone]}`}>
            {copy.eyebrow}
          </div>
        </div>

        <h1>{copy.title}</h1>
        <p>{copy.message}</p>

        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryAction}>
            Go to login
          </Link>

          <Link href="/" className={styles.secondaryAction}>
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
