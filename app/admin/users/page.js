"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Mail, MapPin, Pencil, Phone, Search, ShieldCheck, SlidersHorizontal, Trash2, UserPlus, UsersRound, X } from "lucide-react";
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
  const [refreshUsers, setRefreshUsers] = useState(0);
  const addUserButtonRef = useRef(null);
  const modalRef = useRef(null);
  const modalWasOpen = useRef(false);
  const isModalOpen = modal !== null;
  useEffect(() => { let cancelled = false; const query = new URLSearchParams({ page: "1", pageSize: String(pageSize), search, role, status, sort }); fetch(`/api/admin/users?${query}`).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.message); if (!cancelled) { setUsers(payload.users); setTotal(payload.total); setError(""); } }).catch((cause) => !cancelled && setError(cause.message || "Users could not be loaded.")).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true; }; }, [search, role, status, sort, refreshUsers]);
  useEffect(() => {
    const addUserButton = addUserButtonRef.current;
    if (!isModalOpen) {
      if (modalWasOpen.current) {
        modalWasOpen.current = false;
        addUserButton?.focus();
      }
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const isOpening = !modalWasOpen.current;
    modalWasOpen.current = true;
    document.body.style.overflow = "hidden";
    const frame = isOpening ? window.requestAnimationFrame(() => {
      const firstField = modalRef.current?.querySelector("form input, form select") || modalRef.current?.querySelector("input, select, button");
      firstField?.focus();
    }) : null;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        setModal(null);
        setActionError("");
      }

      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen, saving]);
  const clearFilters = () => { setDraft(""); setSearch(""); setRole("all"); setStatus("all"); setSort("joined"); };
  const performSearch = (event) => { event?.preventDefault(); setSearch(draft); };
  const openEdit = (user) => { setActionError(""); setModal({ type: "edit", user, name: user.name, phoneNumber: user.phoneNumber || "" }); };
  const request = async (url, options) => { const response = await fetch(url, options); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "The user could not be updated."); return payload; };
  const saveEdit = async () => { setSaving(true); setActionError(""); try { const { user } = await request(`/api/admin/users/${modal.user.userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: modal.name, phoneNumber: modal.phoneNumber }) }); setUsers((items) => items.map((item) => item.userId === user.userId ? user : item)); setModal(null); } catch (cause) { setActionError(cause.message); } finally { setSaving(false); } };
  const confirmDelete = async () => { setSaving(true); setActionError(""); try { await request(`/api/admin/users/${modal.user.userId}`, { method: "DELETE" }); setUsers((items) => items.filter((item) => item.userId !== modal.user.userId)); setTotal((value) => Math.max(0, value - 1)); setModal(null); } catch (cause) { setActionError(cause.message); } finally { setSaving(false); } };
  const openAdd = () => { setActionError(""); setModal({ type: "add", name: "", email: "", phoneNumber: "", address: "", role: "pet_owner", password: "" }); };
  const createUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    try {
      await request("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modal.name,
          email: modal.email,
          phoneNumber: modal.phoneNumber,
          address: modal.address,
          role: modal.role,
          password: modal.password,
        }),
      });
      setLoading(true);
      setRefreshUsers((value) => value + 1);
      setModal(null);
    } catch (cause) {
      setActionError(cause.message);
    } finally {
      setSaving(false);
    }
  };
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
        <button ref={addUserButtonRef} className={styles.addButton} type="button" onClick={openAdd}><UserPlus size={16} aria-hidden="true" />Add User</button>
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

      {modal && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) { setModal(null); setActionError(""); } }}>
          <section ref={modalRef} className={`${styles.modal} ${modal.type === "add" ? styles.addUserModal : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" tabIndex="-1">
            <header className={styles.modalHeader}>
              <span className={styles.modalIcon}>{modal.type === "add" ? <UserPlus size={20} aria-hidden="true" /> : <Pencil size={19} aria-hidden="true" />}</span>
              <div>
                <h2 id="modal-title">{modal.type === "add" ? "Add a user" : modal.type === "edit" ? "Edit user" : "Delete user"}</h2>
                <p id="modal-description">{modal.type === "add" ? "Create a pet owner or sitter account." : modal.type === "edit" ? "Update this member’s profile details." : "This action permanently removes the account."}</p>
              </div>
              <button className={styles.modalClose} type="button" aria-label="Close dialog" onClick={() => { setModal(null); setActionError(""); }} disabled={saving}><X size={18} aria-hidden="true" /></button>
            </header>

            {modal.type === "add" ? (
              <form className={styles.modalForm} onSubmit={createUser}>
                <div className={styles.modalFields}>
                  <label><span className={styles.fieldLabel}>Full name</span><input autoComplete="name" name="name" value={modal.name} onChange={(event) => setModal({ ...modal, name: event.target.value })} required maxLength="200" placeholder="e.g. Maya Perera" disabled={saving} /></label>
                  <label><span className={styles.fieldLabel}>Email address</span><span className={styles.inputWrap}><Mail size={16} aria-hidden="true" /><input autoComplete="email" name="email" type="email" value={modal.email} onChange={(event) => setModal({ ...modal, email: event.target.value })} required placeholder="name@example.com" disabled={saving} /></span></label>
                  <label><span className={styles.fieldLabel}>Phone number</span><span className={styles.inputWrap}><Phone size={16} aria-hidden="true" /><input autoComplete="tel" name="phoneNumber" type="tel" value={modal.phoneNumber} onChange={(event) => setModal({ ...modal, phoneNumber: event.target.value })} placeholder="+94 77 123 4567" disabled={saving} /></span></label>
                  <label><span className={styles.fieldLabel}>Account type</span><select name="role" value={modal.role} onChange={(event) => setModal({ ...modal, role: event.target.value })} disabled={saving}><option value="pet_owner">Pet owner</option><option value="sitter">Pet sitter</option></select></label>
                  <label className={styles.fullWidth}><span className={styles.fieldLabel}>Address</span><span className={styles.inputWrap}><MapPin size={16} aria-hidden="true" /><input autoComplete="street-address" name="address" value={modal.address} onChange={(event) => setModal({ ...modal, address: event.target.value })} required maxLength="255" placeholder="Street address, city" disabled={saving} /></span></label>
                  <label className={styles.fullWidth}><span className={styles.fieldLabel}>Temporary password</span><input autoComplete="new-password" name="password" type="password" value={modal.password} onChange={(event) => setModal({ ...modal, password: event.target.value })} required minLength="8" placeholder="At least 8 characters" disabled={saving} /><small className={styles.fieldHint}><ShieldCheck size={14} aria-hidden="true" />The user can change this after signing in.</small></label>
                </div>
                {actionError && <p className={styles.modalError} role="alert">{actionError}</p>}
                <div className={styles.modalActions}>
                  <button className={styles.cancelButton} type="button" onClick={() => { setModal(null); setActionError(""); }} disabled={saving}>Cancel</button>
                  <button className={styles.confirmButton} type="submit" disabled={saving}><UserPlus size={15} aria-hidden="true" />{saving ? "Creating account…" : "Create user"}</button>
                </div>
              </form>
            ) : (
              <div className={styles.modalForm}>
                {modal.type === "edit" ? (
                  <div className={styles.modalFields}>
                    <label className={styles.fullWidth}>Name<input value={modal.name} onChange={(event) => setModal({ ...modal, name: event.target.value })} disabled={saving} /></label>
                    <label className={styles.fullWidth}>Phone number<input value={modal.phoneNumber} onChange={(event) => setModal({ ...modal, phoneNumber: event.target.value })} disabled={saving} /></label>
                  </div>
                ) : <p className={styles.deletePrompt}>Delete <strong>{modal.user.name}</strong>? This cannot be undone.</p>}
                {actionError && <p className={styles.modalError} role="alert">{actionError}</p>}
                <div className={styles.modalActions}>
                  <button className={styles.cancelButton} type="button" onClick={() => { setModal(null); setActionError(""); }} disabled={saving}>Cancel</button>
                  <button className={`${styles.confirmButton} ${modal.type === "delete" ? styles.dangerButton : ""}`} type="button" onClick={modal.type === "edit" ? saveEdit : confirmDelete} disabled={saving}>{saving ? "Saving…" : modal.type === "edit" ? "Save changes" : "Delete user"}</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
