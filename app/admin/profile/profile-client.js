"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";

function InlineIcon({ name }) {
  switch (name) {
    case "user":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 12.1a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.2 19.3c.8-3.2 3.6-5.4 6.8-5.4s6 2.2 6.8 5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "mail":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="m5.5 8 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "pin":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20s5-4.2 5-9a5 5 0 1 0-10 0c0 4.8 5 9 5 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="12" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 3 7 3v5c0 4.4-3 8.2-7 10-4-1.8-7-5.6-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9.5 12.2 1.5 1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4.5l3 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3.8v3.2M16 3.8v3.2M4 9.5h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "lock":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="6" y="10" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.8 12.2 2.2 2.2 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "edit":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m5 16.8 1.2-4.2L15.7 3.1l4.2 4.2-9.5 9.5L5 16.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M13.3 5.4 18.6 10.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function Field({ label, value, icon, fullWidth = false }) {
  return (
    <div className={`${styles.infoField} ${fullWidth ? styles.infoFieldWide : ""}`}>
      <span className={styles.fieldIcon} aria-hidden="true">
        <InlineIcon name={icon} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, icon, tone = "neutral" }) {
  return (
    <div className={`${styles.summaryStat} ${styles[tone]}`}>
      <span className={styles.statIcon} aria-hidden="true">
        <InlineIcon name={icon} />
      </span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SecurityTile({ label, value, icon, tone = "neutral", action, actionLabel, chips = [] }) {
  return (
    <div className={styles.securityTile}>
      <div className={styles.securityTileHeader}>
        <span className={`${styles.securityIcon} ${styles[tone]}`} aria-hidden="true">
          <InlineIcon name={icon} />
        </span>
        <div>
          <small>{label}</small>
          <strong>{value}</strong>
        </div>
      </div>
      {chips.length ? (
        <div className={styles.permissionChips}>
          {chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
      ) : null}
      {action ? (
        <button type="button" className={styles.securityAction} onClick={action}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, visible, onToggle, error, autoComplete }) {
  return (
    <label className={styles.passwordField} htmlFor={id}>
      <span className={styles.inputLabel}>{label}</span>
      <div className={`${styles.inputShell} ${error ? styles.inputError : ""}`}>
        <span className={styles.inputIcon} aria-hidden="true">
          <InlineIcon name="lock" />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={styles.textInput}
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <small className={styles.errorText}>{error}</small>}
    </label>
  );
}

function ModalRequirement({ ok, children }) {
  return (
    <li className={ok ? styles.requirementOk : styles.requirementPending}>
      <span aria-hidden="true">{ok ? "✓" : "•"}</span>
      {children}
    </li>
  );
}

export default function ProfileClient({ data, notice = "" }) {
  const [banner, setBanner] = useState(notice);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValues, setPasswordValues] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const modalRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    setBanner(notice);
  }, [notice]);

  useEffect(() => {
    submittingRef.current = submittingPassword;
  }, [submittingPassword]);

  useEffect(() => {
    if (!passwordOpen) {
      return undefined;
    }

    const previousFocus = document.activeElement;
    const focusable = () =>
      modalRef.current?.querySelectorAll('button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])');
    const first = () => focusable()?.[0];
    const last = () => {
      const nodes = focusable();
      return nodes?.[nodes.length - 1];
    };

    requestAnimationFrame(() => first()?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submittingRef.current) {
        closePasswordModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const nodes = focusable();
      if (!nodes?.length) {
        return;
      }

      if (event.shiftKey && document.activeElement === first()) {
        event.preventDefault();
        last()?.focus();
      } else if (!event.shiftKey && document.activeElement === last()) {
        event.preventDefault();
        first()?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [passwordOpen]);

  const passwordChecks = useMemo(
    () => ({
      length: passwordValues.newPassword.length >= 8,
      upper: /[A-Z]/.test(passwordValues.newPassword),
      lower: /[a-z]/.test(passwordValues.newPassword),
      number: /\d/.test(passwordValues.newPassword),
      special: /[^A-Za-z0-9]/.test(passwordValues.newPassword),
    }),
    [passwordValues.newPassword],
  );

  const accountCreated = formatDate(data.profile.createdAt);
  const profileBadge = data.profile.isVerified ? "ADMIN" : "PENDING";
  const systemStatus = data.platformStatus.systemLabel || "Operational";

  function openPasswordModal() {
    setPasswordMessage("");
    setPasswordErrors({});
    setPasswordTouched(false);
    setPasswordOpen(true);
    setPasswordValues({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  }

  function closePasswordModal(force = false) {
    if (submittingPassword && !force) {
      return;
    }

    setPasswordOpen(false);
    setPasswordMessage("");
    setPasswordErrors({});
    setPasswordTouched(false);
    setPasswordValues({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  function validatePasswordForm() {
    const nextErrors = {};

    if (!passwordValues.currentPassword.trim()) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!passwordChecks.length || !passwordChecks.upper || !passwordChecks.lower || !passwordChecks.number || !passwordChecks.special) {
      nextErrors.newPassword = "Use at least 8 characters with upper, lower, number, and symbol.";
    }

    if (passwordValues.newPassword && passwordValues.currentPassword && passwordValues.newPassword === passwordValues.currentPassword) {
      nextErrors.newPassword = "The new password must be different from the current password.";
    }

    if (!passwordValues.confirmNewPassword.trim()) {
      nextErrors.confirmNewPassword = "Please confirm the new password.";
    } else if (passwordValues.confirmNewPassword !== passwordValues.newPassword) {
      nextErrors.confirmNewPassword = "Passwords do not match.";
    }

    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordTouched(true);
    setPasswordMessage("");

    if (!validatePasswordForm()) {
      return;
    }

    setSubmittingPassword(true);
    try {
      const response = await fetch("/api/admin/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordValues),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to update your password. Please try again.");
      }

      setBanner("Password changed successfully.");
      closePasswordModal(true);
    } catch (error) {
      setPasswordMessage(error.message || "Unable to update your password. Please try again.");
      setPasswordErrors((current) => ({
        ...current,
        currentPassword:
          error.message === "The current password is incorrect."
            ? "The current password is incorrect."
            : current.currentPassword,
      }));
    } finally {
      setSubmittingPassword(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumbs}>
        <span>Dashboard</span>
        <span>›</span>
        <strong>My Profile</strong>
      </div>

      <header className={styles.header}>
        <div>
          <h1>Admin Profile</h1>
          <p>Manage your profile information and account settings.</p>
        </div>
      </header>

      {banner && <div className={styles.successBanner} role="status">{banner}</div>}

      <div className={styles.summaryGrid}>
        <article className={styles.profileCard}>
          <div className={styles.profileHero}>
            <div className={styles.avatarWrap}>
              <span className={styles.avatar}>{data.profile.initials}</span>
            </div>
            <div className={styles.profileMeta}>
              <h2>{data.profile.fullName}</h2>
              <p>{data.profile.email}</p>
              <span className={styles.profileRoleBadge}>{profileBadge}</span>
            </div>
          </div>
        </article>

        <article className={styles.statusCard}>
          <div className={styles.cardHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">
              <InlineIcon name="shield" />
            </span>
            <div>
              <h3>Platform Status</h3>
              <p>Quick snapshot of the admin platform.</p>
            </div>
          </div>

          <div className={styles.statusGrid}>
            <SummaryStat label="System Status" value={systemStatus} icon="check" tone="success" />
            <SummaryStat label="Pending Audits" value={String(data.platformStatus.pendingAudits)} icon="clock" tone="warning" />
            <SummaryStat label="Last Login" value={data.profile.lastLogin} icon="calendar" tone="neutral" />
          </div>
        </article>
      </div>

      <article className={styles.infoCard}>
        <div className={styles.cardHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            <InlineIcon name="user" />
          </span>
          <div>
            <h3>Personal Information</h3>
            <p>Update the information displayed on your administrator profile.</p>
          </div>
          <Link href="/admin/profile/edit" className={styles.editButton}>
            <InlineIcon name="edit" />
            Edit Profile
          </Link>
        </div>

        <div className={styles.infoGrid}>
          <Field label="Full Name" value={data.personalInfo.fullName} icon="user" />
          <Field label="Email Address" value={data.personalInfo.email} icon="mail" />
          <Field label="Location" value={data.profile.location} icon="pin" />
          <Field label="Admin Role" value={data.personalInfo.adminRole} icon="shield" />
          <Field label="Staff ID" value={data.personalInfo.staffId} icon="calendar" />
        </div>
      </article>

      <article className={styles.securityCard}>
        <div className={styles.cardHeader}>
          <span className={styles.sectionIcon} aria-hidden="true">
            <InlineIcon name="lock" />
          </span>
          <div>
            <h3>Account &amp; Security</h3>
            <p>Overview of account health and permissions.</p>
          </div>
        </div>

        <div className={styles.securityGrid}>
          <SecurityTile label="Account Status" value="Active" icon="user" tone="success" />
          <SecurityTile label="Email Verification" value="Verified" icon="check" tone="success" />
          <SecurityTile
            label="Password Security"
            value="Password is securely protected"
            icon="lock"
            tone="neutral"
            action={openPasswordModal}
            actionLabel="Change Password"
          />
          <SecurityTile label="Last Login" value={data.profile.lastLogin} icon="clock" tone="neutral" />
          <SecurityTile label="Account Created" value={accountCreated} icon="calendar" tone="neutral" />
          <SecurityTile
            label="Role & Permissions"
            value="ADMIN"
            icon="shield"
            tone="success"
            chips={["User Management", "Booking Management", "Marketplace Moderation"]}
          />
        </div>
      </article>

      {passwordOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submittingPassword) {
              closePasswordModal();
            }
          }}
        >
          <section
            ref={modalRef}
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-dialog-title"
            aria-describedby="password-dialog-description"
          >
            <header className={styles.modalHeader}>
              <div className={styles.modalIcon} aria-hidden="true">
                <InlineIcon name="lock" />
              </div>
              <div>
                <h2 id="password-dialog-title">Change Password</h2>
                <p id="password-dialog-description">Create a strong new password for your administrator account.</p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                aria-label="Close change password dialog"
                onClick={closePasswordModal}
                disabled={submittingPassword}
              >
                ×
              </button>
            </header>

            {passwordMessage && <div className={styles.modalError} role="alert">{passwordMessage}</div>}

            <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
              <PasswordField
                id="currentPassword"
                label="Current Password"
                value={passwordValues.currentPassword}
                onChange={(event) => setPasswordValues((current) => ({ ...current, currentPassword: event.target.value }))}
                visible={showCurrent}
                onToggle={() => setShowCurrent((value) => !value)}
                error={passwordTouched ? passwordErrors.currentPassword : ""}
                autoComplete="current-password"
              />

              <PasswordField
                id="newPassword"
                label="New Password"
                value={passwordValues.newPassword}
                onChange={(event) => setPasswordValues((current) => ({ ...current, newPassword: event.target.value }))}
                visible={showNew}
                onToggle={() => setShowNew((value) => !value)}
                error={passwordTouched ? passwordErrors.newPassword : ""}
                autoComplete="new-password"
              />

              <ul className={styles.requirements}>
                <ModalRequirement ok={passwordChecks.length}>At least 8 characters</ModalRequirement>
                <ModalRequirement ok={passwordChecks.upper}>One uppercase letter</ModalRequirement>
                <ModalRequirement ok={passwordChecks.lower}>One lowercase letter</ModalRequirement>
                <ModalRequirement ok={passwordChecks.number}>One number</ModalRequirement>
                <ModalRequirement ok={passwordChecks.special}>One special character</ModalRequirement>
              </ul>

              <PasswordField
                id="confirmNewPassword"
                label="Confirm New Password"
                value={passwordValues.confirmNewPassword}
                onChange={(event) => setPasswordValues((current) => ({ ...current, confirmNewPassword: event.target.value }))}
                visible={showConfirm}
                onToggle={() => setShowConfirm((value) => !value)}
                error={passwordTouched ? passwordErrors.confirmNewPassword : ""}
                autoComplete="new-password"
              />

              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryButton} onClick={closePasswordModal} disabled={submittingPassword}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryButton} disabled={submittingPassword}>
                  {submittingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
