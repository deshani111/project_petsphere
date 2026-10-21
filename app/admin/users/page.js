"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Search, SlidersHorizontal, Trash2, UserPlus, UsersRound } from "lucide-react";
import styles from "./page.module.css";

const pageSize = 8;
const displayDate = (date) => {
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(value);
};
const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [draft, setDraft] = useState(""); const [search, setSearch] = useState(""); const [showFilters, setShowFilters] = useState(false);
  const [role, setRole] = useState("all"); const [status, setStatus] = useState("all"); const [sort, setSort] = useState("joined"); const [modal, setModal] = useState(null); const [saving, setSaving] = useState(false); const [actionError, setActionError] = useState("");
  useEffect(() => { let cancelled = false; const query = new URLSearchParams({ page: "1", pageSize: String(pageSize), search, role, status, sort }); fetch(`/api/admin/users?${query}`).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.message); if (!cancelled) { setUsers(payload.users); setTotal(payload.total); } }).catch((cause) => !cancelled && setError(cause.message || "Users could not be loaded.")).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true; }; }, [search, role, status, sort]);
  const clearFilters = () => { setDraft(""); setSearch(""); setRole("all"); setStatus("all"); setSort("joined"); };
  const performSearch = (event) => { event?.preventDefault(); setSearch(draft); };
  const openEdit = (user) => { setActionError(""); setModal({ type: "edit", user, name: user.name, phoneNumber: user.phoneNumber || "" }); };
  const request = async (url, options) => { const response = await fetch(url, options); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "The user could not be updated."); return payload; };
  const saveEdit = async () => { setSaving(true); setActionError(""); try { const { user } = await request(`/api/admin/users/${modal.user.userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: modal.name, phoneNumber: modal.phoneNumber }) }); setUsers((items) => items.map((item) => item.userId === user.userId ? user : item)); setModal(null); } catch (cause) { setActionError(cause.message); } finally { setSaving(false); } };
  const confirmDelete = async () => { setSaving(true); setActionError(""); try { await request(`/api/admin/users/${modal.user.userId}`, { method: "DELETE" }); setUsers((items) => items.filter((item) => item.userId !== modal.user.userId)); setTotal((value) => Math.max(0, value - 1)); setModal(null); } catch (cause) { setActionError(cause.message); } finally { setSaving(false); } };
  if (loading) return <section className={styles.usersPage}><div className={styles.emptyState}>Loading users…</div></section>;
  if (error) return <section className={styles.usersPage}><div className={styles.emptyState} role="alert">{error}</div></section>;
  return (
    <section className={styles.usersPage}>
      <header className={styles.pageHeading}>
        <div><span>ADMINISTRATION</span><h1>Users</h1><p>Manage PetSphere member accounts.</p></div>
        <strong>{total} users</strong>
      </header>
      <form className={styles.toolbar} onSubmit={performSearch}>
        <label className={styles.searchField}>
          <Search size={17} aria-hidden="true" />
          <input aria-label="Search users by name, email, or ID" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search by name, email, or ID..." />
        </label>
        <button className={styles.primaryButton} type="submit"><Search size={15} aria-hidden="true" />Search</button>
        <button className={styles.filterButton} type="button" aria-expanded={showFilters} onClick={() => setShowFilters((open) => !open)}><SlidersHorizontal size={15} aria-hidden="true" />Filter &amp; Sort</button>
        <Link className={styles.pendingButton} href="/admin/users/pending-verifications"><UsersRound size={15} aria-hidden="true" />Pending Users</Link>
        <Link className={styles.addButton} href="/admin/users/new"><UserPlus size={16} aria-hidden="true" />Add User</Link>
      </form>

      {showFilters && (
        <div className={styles.filters}>
          <label>Role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="all">All</option><option value="pet_owner">Pet Owner</option><option value="sitter">Sitter</option></select></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></select></label>
          <label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="joined">Joined date</option><option value="name">Name</option></select></label>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      )}

      <article className={styles.tableCard}>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th scope="col">User</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Joined date</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>
              {users.slice(0, pageSize).map((user) => (
                <tr key={user.id}>
                  <td data-label="User"><div className={styles.person}><span className={styles.avatar}>{user.name.split(" ").map((part) => part[0]).join("")}</span><strong>{user.name}</strong></div></td>
                  <td data-label="Email" className={styles.emailCell}>{user.email}</td>
                  <td data-label="Role"><span className={`${styles.role} ${styles[user.role]}`}>{user.role === "sitter" ? "Sitter" : "Pet Owner"}</span></td>
                  <td data-label="Joined date">{displayDate(user.joined)}</td>
                  <td data-label="Status"><span className={`${styles.status} ${styles[user.status]}`}><i />{titleCase(user.status)}</span></td>
                  <td data-label="Actions"><div className={styles.actions}>
                    <button type="button" aria-label={`Edit ${user.name}`} title="Edit user" onClick={() => openEdit(user)}><Pencil size={16} aria-hidden="true" /></button>
                    <button type="button" aria-label={`Delete ${user.name}`} title="Delete user" onClick={() => { setActionError(""); setModal({ type: "delete", user }); }}><Trash2 size={16} aria-hidden="true" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <div className={styles.emptyState}><strong>No users found</strong><span>Try changing your search or filters.</span><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        </div>
        <footer className={styles.pagination}>
          <span>Showing {users.length ? "1" : "0"}–{Math.min(users.length, pageSize)} of {total} users</span>
          <div><button type="button" disabled aria-label="Previous page"><ChevronLeft size={16} aria-hidden="true" /></button><button type="button" className={styles.current} aria-current="page">1</button><button type="button" disabled>2</button><button type="button" disabled>3</button><em>…</em><button type="button" disabled aria-label="Next page"><ChevronRight size={16} aria-hidden="true" /></button></div>
        </footer>
      </article>

      {modal && <div className={styles.modalBackdrop} role="presentation"><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title"><h2 id="modal-title">{modal.type === "edit" ? "Edit user" : "Delete user"}</h2>{modal.type === "edit" ? <><label>Name<input value={modal.name} onChange={(event) => setModal({ ...modal, name: event.target.value })} disabled={saving} /></label><label>Phone number<input value={modal.phoneNumber} onChange={(event) => setModal({ ...modal, phoneNumber: event.target.value })} disabled={saving} /></label></> : <p>Delete {modal.user.name}? This cannot be undone.</p>}{actionError && <p role="alert">{actionError}</p>}<div><button type="button" onClick={() => setModal(null)} disabled={saving}>Cancel</button><button type="button" onClick={modal.type === "edit" ? saveEdit : confirmDelete} disabled={saving}>{saving ? "Saving…" : modal.type === "edit" ? "Save changes" : "Delete"}</button></div></section></div>}
    </section>
  );
}
