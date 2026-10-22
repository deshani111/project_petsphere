"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [status, setStatus] = useState(token ? { type: "", message: "" } : { type: "error", message: "This password reset link is invalid or has expired. Please request a new one." });

  async function submit(event) {
    event.preventDefault();
    if (form.password.length < 8) return setStatus({ type: "error", message: "Password must be at least 8 characters long." });
    if (form.password !== form.confirmPassword) return setStatus({ type: "error", message: "Passwords do not match." });
    setStatus({ type: "loading", message: "Resetting your password..." });
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, ...form }) });
      const payload = await response.json();
      setStatus({ type: response.ok ? "success" : "error", message: payload.message || "Unable to reset your password." });
    } catch { setStatus({ type: "error", message: "Unable to reach PetSphere. Please try again." }); }
  }

  const successful = status.type === "success";
  return <main className={styles.page}><section className={styles.card}>
    <span className={styles.kicker}>Account recovery</span><h1>{successful ? "Password reset" : "Choose a new password"}</h1>
    <p>{successful ? "Your password has changed. For your security, please sign in again." : "Use at least 8 characters. This link can only be used once."}</p>
    {!successful ? <form onSubmit={submit} noValidate>
      <label htmlFor="password">New password</label><input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
      {status.message ? <p className={`${styles.message} ${styles[status.type] || ""}`} role="status" aria-live="polite">{status.message}</p> : null}
      <button type="submit" disabled={!token || status.type === "loading"}>{status.type === "loading" ? "Resetting..." : "Reset password"}</button>
    </form> : null}
    <Link className={styles.back} href={successful ? "/login" : "/forgot-password"}>{successful ? "Go to sign in" : "Request a new link"}</Link>
  </section></main>;
}
