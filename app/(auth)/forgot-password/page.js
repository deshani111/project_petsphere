"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17z" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></svg>;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const sent = status.type === "success";

  async function submit(event) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }
    setStatus({ type: "loading", message: "" });
    try {
      const response = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const payload = await response.json();
      setStatus({ type: response.ok ? "success" : "error", message: payload.message || "We could not process your request. Please try again." });
    } catch {
      setStatus({ type: "error", message: "We could not reach PetSphere. Please try again in a moment." });
    }
  }

  function tryAnotherEmail() {
    setStatus({ type: "", message: "" });
    setEmail("");
  }

  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.recoveryHeading}>
      <div className={styles.iconCircle}><img src="/petsphere-mark.svg" alt="" /></div>
      <div className={styles.headingLabel}><span>PetSphere</span><strong>Account recovery</strong></div>
    </div>
    <h1>{sent ? "Please check your email" : "Let’s get you back in"}</h1>
    <p className={styles.intro}>{sent ? "We’ll help you securely reset your password." : "Enter the email address linked to your PetSphere account and we’ll guide you through resetting your password."}</p>

    {sent ? <div className={styles.successPanel} role="status" aria-live="polite">
      <p>{status.message}</p>
      <span>For your security, the link expires in one hour and can be used only once.</span>
    </div> : <form onSubmit={submit} noValidate>
      <label htmlFor="email">Email address</label>
      <div className={styles.inputWrap}><MailIcon /><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); if (status.type === "error") setStatus({ type: "", message: "" }); }} placeholder="name@example.com" aria-invalid={status.type === "error"} aria-describedby={status.type === "error" ? "recovery-message" : undefined} required /></div>
      {status.message ? <p id="recovery-message" className={`${styles.message} ${styles[status.type] || ""}`} role="alert">{status.message}</p> : null}
      <button type="submit" disabled={status.type === "loading"}>{status.type === "loading" ? "Sending secure link…" : "Email me a secure reset link"}</button>
    </form>}

    {sent ? <button type="button" className={styles.textButton} onClick={tryAnotherEmail}>Try a different email address</button> : null}
    <div className={styles.divider}><span>or</span></div>
    <Link className={styles.back} href="/login">Return to sign in</Link>
  </section></main>;
}
