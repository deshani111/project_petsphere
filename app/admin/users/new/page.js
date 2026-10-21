"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../page.module.css";

export default function NewAdminUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", address: "", role: "pet_owner", password: "" });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); try { const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "User could not be created."); router.push("/admin/users"); router.refresh(); } catch (cause) { setError(cause.message); } finally { setSaving(false); } };
  return <section className={styles.usersPage}><article className={styles.tableCard}><form className={styles.newUserForm} onSubmit={submit}><div className={styles.newUserHeading}><div><h1>Add new user</h1><p>Create a pet owner or sitter account.</p></div><Link href="/admin/users">Cancel</Link></div><label>Full name<input name="name" value={form.name} onChange={update} required maxLength="200" /></label><label>Email address<input name="email" type="email" value={form.email} onChange={update} required /></label><label>Phone number<input name="phoneNumber" value={form.phoneNumber} onChange={update} /></label><label>Address<input name="address" value={form.address} onChange={update} required maxLength="255" /></label><label>Role<select name="role" value={form.role} onChange={update}><option value="pet_owner">Pet Owner</option><option value="sitter">Sitter</option></select></label><label>Temporary password<input name="password" type="password" value={form.password} onChange={update} required minLength="8" /></label>{error && <p className={styles.formError} role="alert">{error}</p>}<div className={styles.formActions}><Link href="/admin/users">Cancel</Link><button type="submit" disabled={saving}>{saving ? "Creating…" : "Create user"}</button></div></form></article></section>;
}
