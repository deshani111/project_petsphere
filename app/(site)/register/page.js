"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

const initialFormState = {
  role: "owner",
  fullName: "",
  phoneNumber: "",
  email: "",
  address: "",
  password: "",
  confirmPassword: "",
};

const passwordRuleMessage =
  "Use 8–16 characters with an uppercase letter, lowercase letter, and special character.";

function hasValidPassword(password) {
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9\s]/.test(password)
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

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!formData.address) {
      return "Please fill in all required fields.";
    }

    if (!hasValidPassword(formData.password)) {
      return passwordRuleMessage;
    }

    if (
      formData.password.trim().toLowerCase() ===
      formData.email.trim().toLowerCase()
    ) {
      return "Your password cannot be the same as your email address.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setStatus({ state: "error", message: validationError });
      return;
    }

    setStatus({ state: "loading", message: "Creating your account..." });

    const registrationPayload = {
      role: formData.role,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationPayload),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus({ state: "error", message: payload.message || "Could not create account." });
        return;
      }

      setStatus({ state: "success", message: payload.message });
      setFormData(initialFormState);
    } catch {
      setStatus({
        state: "error",
        message: "Could not reach the registration service. Please try again.",
      });
    }
  }

  return (
    <main className={styles.registerPage}>
      <div className={styles.glowOne} aria-hidden="true" />
      <div className={styles.glowTwo} aria-hidden="true" />
      <section className={styles.panelWrap}>
        <aside className={styles.infoPanel}>
          <div className={styles.infoCopy}>
            <p className={styles.eyebrow}>PetSphere</p>
            <h1>Your pet&apos;s <span>happy place.</span></h1>
          </div>

          <div className={styles.imageFrame}>
            <Image
              src="/register-dog-care-pexels.webp"
              alt="A woman holding her golden retriever at home"
              fill
              priority
              sizes="(max-width: 850px) 100vw, 44vw"
            />
          </div>

        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formHeading}>
            <h2>Create your account</h2>
          </div>

          <p className={styles.sectionLabel}>I&apos;m joining as</p>
          <div className={styles.roleGrid}>
            <button
              type="button"
              className={formData.role === "owner" ? styles.activeRole : ""}
              onClick={() => setFormData((prev) => ({ ...prev, role: "owner" }))}
              aria-pressed={formData.role === "owner"}
            >
              <span className={styles.roleIcon} aria-hidden="true">♡</span>
              <span className={styles.roleCopy}>
                <strong>Pet owner</strong>
              </span>
              <span className={styles.roleCheck} aria-hidden="true">✓</span>
            </button>
            <button
              type="button"
              className={formData.role === "sitter" ? styles.activeRole : ""}
              onClick={() => setFormData((prev) => ({ ...prev, role: "sitter" }))}
              aria-pressed={formData.role === "sitter"}
            >
              <span className={styles.roleIcon} aria-hidden="true">⌂</span>
              <span className={styles.roleCopy}>
                <strong>Pet sitter</strong>
              </span>
              <span className={styles.roleCheck} aria-hidden="true">✓</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div>
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label htmlFor="phoneNumber">Phone number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                autoComplete="tel"
                required
              />
            </div>
            <div>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          <div>
            <label htmlFor="address">Residential address</label>
            <input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your home address"
              autoComplete="street-address"
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordField}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                maxLength={16}
                title={passwordRuleMessage}
                aria-describedby="password-requirements"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
            <p id="password-requirements" className={styles.passwordRequirements}>
              8–16 characters, uppercase, lowercase &amp; special character.
            </p>
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={styles.passwordField}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                maxLength={16}
                title={passwordRuleMessage}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon hidden={showConfirmPassword} />
              </button>
            </div>
            </div>

            <button type="submit" disabled={status.state === "loading"} className={styles.submitBtn}>
              {status.state === "loading" ? "Creating your account…" : "Create my account"}
            </button>
          </form>

          {status.message ? (
            <p
              role="status"
              aria-live="polite"
              className={
                status.state === "error" ? styles.errorMessage : styles.successMessage
              }
            >
              {status.message}
            </p>
          ) : null}

          <p className={styles.signInText}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>
          <p className={styles.termsText}>
            By continuing, you agree to our Terms &amp; Privacy Policy.
          </p>
        </section>
      </section>
    </main>
  );
}
