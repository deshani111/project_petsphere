"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

function Field({ label, value, icon, readOnly = false, onChange, name, type = "text" }) {
  return (
    <label className={styles.inputGroup}>
      <span className={styles.inputLabel}>{label}</span>
      <div className={`${styles.inputShell} ${readOnly ? styles.readOnlyShell : ""}`}>
        <span className={styles.inputIcon} aria-hidden="true">{icon}</span>
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          disabled={readOnly}
          className={styles.textInput}
        />
        {readOnly && <span className={styles.lockChip} aria-hidden="true">Lock</span>}
      </div>
    </label>
  );
}

export default function EditProfileClient({ data }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(data.personalInfo.fullName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  const initials = useMemo(() => data.profile.initials || "AU", [data.profile.initials]);
  const normalizedFullName = fullName.trim().replace(/\s+/g, " ");
  const originalFullName = data.personalInfo.fullName.trim().replace(/\s+/g, " ");
  const canSave = normalizedFullName.length >= 2 && normalizedFullName !== originalFullName && !saving;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldError("");

    const normalized = normalizedFullName;

    if (!normalized) {
      setFieldError("Full name is required.");
      return;
    }

    if (normalized.length < 2) {
      setFieldError("Please enter a valid full name.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: normalized,
          email: data.personalInfo.email,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload.message === "Full name is required.") {
          setFieldError(payload.message);
        } else {
          throw new Error(payload.message || "Unable to update your profile. Please try again.");
        }
        return;
      }

      router.replace("/admin/profile?updated=1");
      router.refresh();
    } catch (loadError) {
      setError(loadError.message || "Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumbs}>
        <span>ADMIN</span>
        <span>/</span>
        <Link href="/admin/profile">PROFILE SETTINGS</Link>
        <span>/</span>
        <strong>EDIT PROFILE</strong>
      </div>

      <header className={styles.headerRow}>
        <div className={styles.headingBlock}>
          <Link href="/admin/profile" className={styles.backButton} aria-label="Back to profile">←</Link>
          <div>
            <h1>Edit Profile</h1>
            <p>Update your personal and administrative information.</p>
          </div>
        </div>
      </header>

      {error && <div className={styles.errorBanner} role="alert">{error}</div>}

      <div className={styles.layout}>
        <aside className={styles.photoCard}>
          <h2>Profile Photo</h2>
          <div className={styles.photoStage}>
            <div className={styles.avatarWrap}>
              <span className={styles.avatar}>{initials}</span>
            </div>
            <p className={styles.uploadNotice}>Avatar upload is unavailable in this build.</p>
          </div>
        </aside>

        <article className={styles.formCard}>
          <div className={styles.cardHeading}>
            <div className={styles.headingIcon}>▣</div>
            <div>
              <h2>Personal Information</h2>
              <p>Update the information displayed on your administrator profile.</p>
            </div>
          </div>

          <form id="edit-profile-form" onSubmit={handleSubmit} className={styles.formGrid}>
            <Field label="Full Name" name="fullName" value={fullName} icon="👤" onChange={(event) => { setFullName(event.target.value); }} />
            <Field label="Email Address" name="email" value={data.personalInfo.email} icon="✉" readOnly />
            <Field label="Location" name="location" value={data.personalInfo.location || "Not available"} icon="⌂" readOnly />
            <Field label="Admin Role" name="adminRole" value={data.personalInfo.adminRole} icon="⛨" readOnly />
            <Field label="Staff ID" name="staffId" value={data.personalInfo.staffId} icon="🪪" readOnly />

            {fieldError && <div className={styles.formError} role="alert">{fieldError}</div>}

            <div className={styles.formActions}>
              <Link href="/admin/profile" className={styles.secondaryButton}>Cancel</Link>
              <button type="submit" className={styles.primaryButton} disabled={!canSave || saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </article>
      </div>
    </section>
  );
}
