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
  city: "",
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
    if (formData.role === "owner" && (!formData.address || !formData.city)) {
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
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    if (formData.role === "owner") {
      registrationPayload.address = formData.address;
      registrationPayload.city = formData.city;
    }

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
      <section className={styles.panelWrap}>
        <aside className={styles.infoPanel}>
          <div className={styles.logo}>PetSphere</div>
          <h1>
            Join Sri Lanka&apos;s <span>Trusted</span> Pet Care Community
          </h1>
          <p>
            Connect with verified, passionate pet sitters who provide personalized care for your
            furry friends. Peace of mind is just a click away.
          </p>
          <img src="/register-pet-care.jpg" alt="Pet sitter sharing a calm moment with a cat at home" />
        </aside>

        <section className={styles.formPanel}>
          <h2>Create Your Account</h2>
          <p>Join our community and start your pet care journey today.</p>

          <div className={styles.roleGrid}>
            <button
              type="button"
              className={formData.role === "owner" ? styles.activeRole : ""}
              onClick={() => setFormData((prev) => ({ ...prev, role: "owner" }))}
            >
              <strong>Pet Owner</strong>
              <span>I want to find the best care for my pets.</span>
            </button>
            <button
              type="button"
              className={formData.role === "sitter" ? styles.activeRole : ""}
              onClick={() => setFormData((prev) => ({ ...prev, role: "sitter" }))}
            >
              <strong>Pet Sitter</strong>
              <span>I want to offer my services to pet owners.</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <div>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label htmlFor="phoneNumber">Phone Number</label>
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
            <div className={styles.fullWidth}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@petsphere.lk"
                autoComplete="email"
                required
              />
            </div>
            {formData.role === "owner" ? (
              <>
                <div className={styles.fullWidth}>
                  <label htmlFor="address">Residential Address</label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="No. 12, Park Road"
                    autoComplete="street-address"
                    required
                  />
                </div>
                <div className={styles.fullWidth}>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Colombo"
                    autoComplete="address-level2"
                    required
                  />
                </div>
              </>
            ) : null}
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
                placeholder="********"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <button type="submit" disabled={status.state === "loading"} className={styles.submitBtn}>
              {status.state === "loading" ? "Creating..." : "Create Account"}
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
            Already have an account? <Link href="/login">Log In</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
