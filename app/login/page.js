"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

const initialFormState = {
  email: "",
  password: "",
  rememberMe: false,
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validateForm() {
    if (!formData.email || !formData.password) {
      return "Please enter your email and password.";
    }

    if (!isValidEmail(formData.email)) {
      return "Please provide a valid email address.";
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

    setStatus({ state: "loading", message: "Checking your details..." });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus({
          state: "error",
          message: payload.message || "Could not log in.",
        });
        return;
      }

      setStatus({ state: "success", message: payload.message });
      router.push(payload.account?.role === "pet_sitter" ? "/sitter" : "/");
    } catch {
      setStatus({
        state: "error",
        message: "Could not reach the login service. Please try again.",
      });
    }
  }

  return (
    <main className={styles.loginPage}>
      <section className={styles.loginShell}>
        <div className={styles.heroPanel}>
          <Link href="/" className={styles.brand} aria-label="PetSphere home">
            <span className={styles.brandMark}>PS</span>
            <span>PetSphere</span>
          </Link>
          <img
            src="/register-pet-care.jpg"
            alt="Pet sitter sharing a calm moment with a cat at home"
          />
        </div>

        <div className={styles.formCard}>
          <div className={styles.formIntro}>
            <h1>Welcome back</h1>
            <p>Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password">Password</label>
                <a href="#forgot-password">Forgot password?</a>
              </div>
              <div className={styles.passwordField}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className={styles.rememberRow}>
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Keep me signed in</span>
            </label>

            {status.message ? (
              <p
                role="status"
                aria-live="polite"
                className={
                  status.state === "error"
                    ? styles.errorMessage
                    : styles.statusMessage
                }
              >
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status.state === "loading"}
              className={styles.submitBtn}
            >
              {status.state === "loading" ? "Checking..." : "Continue"}
            </button>
          </form>

          <p className={styles.signUpText}>
            New to PetSphere? <Link href="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
