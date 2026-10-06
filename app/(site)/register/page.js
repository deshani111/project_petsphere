"use client";

import Link from "next/link";
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

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!formData.address) {
      return "Please fill in all required fields.";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long.";
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
            <p className={styles.eyebrow}>Welcome to PetSphere</p>
          <h1>
              Better care starts with the <span>right connection.</span>
          </h1>
          <p>
              Join a trusted community built to make finding—or providing—
              thoughtful pet care feel simple and safe.
          </p>
          </div>

          <div className={styles.imageFrame}>
            <img
              src="/register-pet-care.jpg"
              alt="Pet sitter sharing a calm moment with a cat at home"
            />
            <div className={styles.trustCard}>
              <span className={styles.checkIcon} aria-hidden="true">✓</span>
              <span><strong>Trusted community</strong>Safe care, lasting connections</span>
            </div>
          </div>

          <div className={styles.benefits} aria-label="PetSphere benefits">
            <span>Verified profiles</span>
            <span>Secure experience</span>
            <span>Local pet lovers</span>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formHeading}>
            <span className={styles.step}>Get started</span>
            <h2>Create your account</h2>
            <p>Choose how you&apos;ll use PetSphere, then tell us about yourself.</p>
          </div>

          <p className={styles.sectionLabel}>I&apos;m joining as a</p>
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
                <small>Find loving, reliable care</small>
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
                <small>Offer care to local owners</small>
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
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
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
            By creating an account, you agree to PetSphere&apos;s Terms of Service and Privacy Policy.
          </p>
        </section>
      </section>
    </main>
  );
}
