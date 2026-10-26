
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

const initialFormState = {
  email: "",
  password: "",
  rememberMe: false,
};

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const VERIFICATION_REQUIRED_MESSAGE =
  "Please verify your email address before logging in.";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 6.5h17v11h-17z" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}

export default function LoginPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({
    state: "idle",
    message: "",
  });
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState({
    state: "idle",
    message: "",
  });

  function handleChange(event) {
    const { checked, name, type, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (status.state === "error") {
      setStatus({ state: "idle", message: "" });
    }

    setShowResend(false);
    setResendStatus({ state: "idle", message: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setShowResend(false);
    setResendStatus({ state: "idle", message: "" });

    if (!formData.email || !formData.password) {
      setStatus({
        state: "error",
        message: "Please enter your email address and password.",
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      setStatus({
        state: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setStatus({ state: "loading", message: "Signing you in…" });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus({
          state: "error",
          message:
            payload.message ||
            "We could not sign you in. Please try again.",
        });

        setShowResend(
          response.status === 403 &&
            payload.message === VERIFICATION_REQUIRED_MESSAGE
        );
        return;
      }

      setStatus({
        state: "success",
        message: payload.message || "Login successful.",
      });

      window.location.replace(payload.redirectTo || "/");
    } catch {
      setStatus({
        state: "error",
        message:
          "We could not reach PetSphere. Please try again in a moment.",
      });
    }
  }

  async function handleResendVerification() {
    setResendStatus({
      state: "loading",
      message: "Sending verification email…",
    });

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const payload = await response.json();

      setResendStatus({
        state: response.ok ? "success" : "error",
        message:
          payload.message ||
          (response.ok
            ? "Verification email sent."
            : "We could not send a verification email."),
      });
    } catch {
      setResendStatus({
        state: "error",
        message:
          "We could not reach PetSphere. Please try again in a moment.",
      });
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <aside className={styles.welcomePanel}>
          <Image
            src="/login-pet-companion.webp"
            alt="A pet owner holding her happy dog"
            className={styles.welcomeImage}
            fill
            sizes="(max-width: 760px) 0px, 46vw"
            priority
          />

          <div className={styles.imageOverlay} />

          <div className={styles.welcomeContent}>
            <div className={styles.brand}>
              <span className={styles.brandMark}>
                <Image
                  src="/petsphere-mark.svg"
                  alt=""
                  width={21}
                  height={21}
                />
              </span>
              Pet<span>Sphere</span>
            </div>

            <div className={styles.welcomeCopy}>
              <span>Care that feels like home</span>
              <h2>Good care starts with a trusted connection.</h2>
              <p>
                From everyday walks to overnight stays, find people who care
                for your pet like family.
              </p>
            </div>

            <div className={styles.trustLine}>
              <b>Pet parents</b>
              <i />
              <b>Caring sitters</b>
            </div>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            <div className={styles.mobileBrand}>
              <Image
                src="/petsphere-mark.svg"
                alt=""
                width={25}
                height={25}
              />
              Pet<span>Sphere</span>
            </div>

            <span className={styles.eyebrow}>Welcome back</span>
            <h1>Welcome back</h1>
            <p className={styles.subtitle}>
              Sign in to manage your pet&apos;s care, bookings, and more.
            </p>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <label htmlFor="email">Email address</label>

              <div className={styles.inputWrap}>
                <MailIcon />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                  aria-invalid={status.state === "error"}
                  required
                />
              </div>

              <div className={styles.labelRow}>
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password">Forgot password?</Link>
              </div>

              <div className={styles.inputWrap}>
                <LockIcon />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={status.state === "error"}
                  required
                />
                <button
                  className={styles.eyeButton}
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>

              <label className={styles.remember}>
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Keep me signed in on this device</span>
              </label>

              {status.message ? (
                <p
                  className={`${styles.message} ${styles[status.state] || ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {status.message}
                </p>
              ) : null}

              {showResend ? (
                <div className={styles.resend}>
                  <p>Your email address still needs verification.</p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus.state === "loading"}
                  >
                    {resendStatus.state === "loading"
                      ? "Sending…"
                      : "Resend verification email"}
                  </button>

                  {resendStatus.message ? (
                    <span
                      className={styles[resendStatus.state]}
                      role="status"
                      aria-live="polite"
                    >
                      {resendStatus.message}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <button
                className={styles.submit}
                type="submit"
                disabled={status.state === "loading"}
              >
                {status.state === "loading"
                  ? "Signing you in…"
                  : "Sign in securely"}
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <p className={styles.createAccount}>
              New to PetSphere?{" "}
              <Link href="/register">Create an account</Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
