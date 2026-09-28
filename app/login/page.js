"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

const initialFormState = { email: "", password: "", rememberMe: false };
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const VERIFICATION_REQUIRED_MESSAGE = "Please verify your email address before logging in.";

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.75h16v10.5H4z"/><path d="m4.5 7.25 7.5 5.5 7.5-5.5"/></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;
}

function EyeIcon({ crossed }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.5"/>{crossed ? <path d="m4 4 16 16"/> : null}</svg>;
}

export default function LoginPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [showResend, setShowResend] = useState(false);
  const [resendStatus, setResendStatus] = useState({ state: "idle", message: "" });

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
    if (status.state === "error") setStatus({ state: "idle", message: "" });
    setShowResend(false);
    setResendStatus({ state: "idle", message: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setShowResend(false);
    setResendStatus({ state: "idle", message: "" });
    if (!formData.email || !formData.password) {
      setStatus({ state: "error", message: "Please enter your email and password." });
      return;
    }
    if (!isValidEmail(formData.email)) {
      setStatus({ state: "error", message: "Please provide a valid email address." });
      return;
    }
    setStatus({ state: "loading", message: "Checking your details..." });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await response.json();
      if (!response.ok) {
        setStatus({ state: "error", message: payload.message || "Could not log in." });
        setShowResend(response.status === 403 && payload.message === VERIFICATION_REQUIRED_MESSAGE);
        return;
      }
      setStatus({ state: "success", message: payload.message });
      window.location.replace("/");
    } catch {
      setStatus({ state: "error", message: "Could not reach the login service. Please try again." });
    }
  }

  async function handleResendVerification() {
    setResendStatus({ state: "loading", message: "Sending verification email..." });

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setResendStatus({ state: "error", message: payload.message || "Could not resend the verification email." });
        return;
      }

      setResendStatus({ state: "success", message: payload.message });
    } catch {
      setResendStatus({ state: "error", message: "Could not reach the verification service. Please try again." });
    }
  }

  return (
    <main className={styles.loginPage}>
      <div className={styles.ambientOne} aria-hidden="true" />
      <div className={styles.ambientTwo} aria-hidden="true" />
      <section className={styles.loginShell}>
        <aside className={styles.storyPanel}>
          <img className={styles.storyImage} src="/login-pets.jpg" alt="A cat and dog relaxing together in the garden" />
          <div className={styles.imageWash} aria-hidden="true" />
          <div className={styles.storyTop}><span className={styles.storyMark} aria-hidden="true">♡</span><span>Care that feels like home</span></div>
          <div className={styles.storyCopy}>
            <p className={styles.storyEyebrow}>Care for every kind of companion</p>
            <h2>Because their best days feel like home.</h2>
            <p>Come back to trusted sitters, thoughtful care, and a community that understands every member of your family.</p>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formInner}>
            <div className={styles.formIntro}>
              <span className={styles.kicker}>Welcome back</span>
              <h1>Sign in to PetSphere</h1>
              <p>Your pet care circle is right where you left it.</p>
            </div>
            <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
              <div className={styles.field}>
                <label htmlFor="email">Email address</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><MailIcon /></span>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" aria-invalid={status.state === "error"} required />
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.labelRow}><label htmlFor="password">Password</label><a href="mailto:support@petsphere.com?subject=Password reset request">Forgot password?</a></div>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" aria-invalid={status.state === "error"} required />
                  <button className={styles.visibilityButton} type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><EyeIcon crossed={showPassword} /></button>
                </div>
              </div>
              <label className={styles.rememberRow}><input name="rememberMe" type="checkbox" checked={formData.rememberMe} onChange={handleChange} /><span>Keep me signed in on this device</span></label>
              {status.message ? <p role="status" aria-live="polite" className={status.state === "error" ? styles.errorMessage : styles.statusMessage}>{status.message}</p> : null}
              {showResend ? (
                <div className={styles.resendPanel}>
                  <button type="button" className={styles.resendButton} onClick={handleResendVerification} disabled={resendStatus.state === "loading"}>
                    {resendStatus.state === "loading" ? "Sending verification email..." : "Resend verification email"}
                  </button>
                  {resendStatus.message ? <p role="status" aria-live="polite" className={resendStatus.state === "error" ? styles.resendError : styles.resendSuccess}>{resendStatus.message}</p> : null}
                </div>
              ) : null}
              <button type="submit" disabled={status.state === "loading"} className={styles.submitButton}><span>{status.state === "loading" ? "Signing you in..." : "Sign in"}</span>{status.state !== "loading" ? <span aria-hidden="true">→</span> : null}</button>
            </form>
            <p className={styles.createAccountText}>
              Don&apos;t have an account? <Link href="/register">Create an account</Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
