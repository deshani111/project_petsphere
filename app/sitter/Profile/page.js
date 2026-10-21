"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Edit3,
  FileCheck2,
  LockKeyhole,
  MapPin,
  Phone,
  Settings2,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import styles from "./profile.module.css";

const fallbackProfile = {
  fullName: "Your profile",
  professionalTitle: "Pet Sitter",
  email: "Loading...",
  phone: "",
  serviceArea: "",
  address: "",
  bio: "",
  notificationsEnabled: true,
  isVerified: false,
  verificationStatus: "Not Submitted",
  experienceYears: 0,
  profileImage: null,
  services: [],
  documents: [],
};
const DEFAULT_PROFILE_IMAGE = "/register-pet-care.jpg";
const DEFAULT_BIO =
  "Professional pet sitter with over 8 years of experience. Certified in pet first aid and CPR. I provide a safe, loving environment for animals of all sizes and temperaments. Specializing in long walks, senior pet care, and high-energy dogs.";

const documentTypes = [
  ["nic_front", "Front of ID"],
  ["nic_back", "Back of ID"],
  ["selfie_with_nic", "Selfie verification (holding ID)"],
];

export default function SitterProfilePage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);
  const [error, setError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    setLoading(true);
    setError("");
    fetch("/api/sitter/profile", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || body.message || "Unable to load your profile.");
        return body.profile || body.data || body;
      })
      .then((result) => {
        if (mounted && result) setProfile({ ...fallbackProfile, ...result });
      })
      .catch((err) => {
        if (mounted && err.name !== "AbortError") setError(err.message || "Unable to load your profile.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [reloadKey]);

  async function toggleNotifications() {
    if (savingPreference) return;
    const nextValue = !profile.notificationsEnabled;
    setSavingPreference(true);
    setError("");
    setProfile((current) => ({ ...current, notificationsEnabled: nextValue }));

    try {
      const response = await fetch("/api/sitter/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: nextValue }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || body.message || "Unable to update preferences.");
      if (body.profile || body.data) setProfile({ ...fallbackProfile, ...(body.profile || body.data) });
    } catch (err) {
      setProfile((current) => ({ ...current, notificationsEnabled: !nextValue }));
      setError(err.message || "Unable to update preferences.");
    } finally {
      setSavingPreference(false);
    }
  }

  const documentByType = new Map((profile.documents || []).map((document) => [document.type, document]));
  const isVerified = profile.isVerified || profile.verificationStatus === "Verified";

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.headingRow}>
          <div>
            <Link href="/sitter" className={styles.back} aria-label="Back to dashboard"><ArrowLeft size={13} /></Link>
            <h1>My Profile</h1>
          </div>
          <Link href="/sitter/Profile/edit" className={styles.editButton}><Edit3 size={11} /> Edit Profile</Link>
        </div>

        <section className={styles.profileCard}>
          <Link href="/sitter/Profile/edit" className={styles.avatarFrame} aria-label="Add or change profile picture">
            <img
              src={profile.profileImage || DEFAULT_PROFILE_IMAGE}
              alt="Profile"
              className={styles.avatarImage}
            />
            <i><Camera size={9} /></i>
          </Link>
          <div className={styles.profileIdentity}>
            <h2>{loading ? "Loading your profile..." : profile.fullName}</h2>
            <p>{profile.email || "No email set"}</p>
            <div className={styles.badges}>
              <span className={isVerified ? styles.greenBadge : styles.grayBadge}>
                <ShieldCheck size={9} /> {isVerified ? "Verified sitter" : "Verification pending"}
              </span>
              <span className={styles.pinkBadge}>Pet sitter since {profile.experienceYears ? new Date().getFullYear() - profile.experienceYears : "2021"}</span>
              <span className={styles.softBadge}>{profile.professionalTitle || "Dog walking"}</span>
              {(profile.services || []).slice(0, 1).map((service) => <span className={styles.softBadge} key={service}>{service}</span>)}
              <span className={styles.greenBadge}><Check size={9} /> Certified First Aid</span>
            </div>
          </div>
        </section>

        {error && (
          <div className={styles.error} role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
          </div>
        )}

        <div className={styles.mainGrid}>
          <section className={styles.card}>
            <div className={styles.cardTitle}><UserRound size={12} /> <h2>Professional Details</h2></div>
            <div className={styles.detailGrid}>
              <Detail label="Phone number" value={profile.phone || "Not set"} icon={<Phone size={10} />} />
              <Detail label="City" value={profile.serviceArea || "Not set"} icon={<MapPin size={10} />} />
              <Detail label="Address" value={profile.address || "Not set"} fullWidth />
            </div>
            <div className={styles.bioBlock}>
              <strong>Bio / About</strong>
              <p>{profile.bio || DEFAULT_BIO}</p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardTitle}><Settings2 size={12} /> <h2>Preferences</h2></div>
            <button className={styles.preference} onClick={toggleNotifications} disabled={savingPreference}>
              <span><strong>Notifications</strong><small>Enable for booking alerts</small></span>
              <i className={profile.notificationsEnabled ? styles.switchOn : styles.switchOff}><em /></i>
            </button>
          </section>
        </div>

        <section className={`${styles.card} ${styles.verificationCard}`}>
          <div className={styles.verificationHeading}>
            <div className={styles.cardTitle}><FileCheck2 size={13} /> <div><h2>Identity Verification</h2><p>Your identity has been verified by the PetSphere trust team.</p></div></div>
            <span className={isVerified ? styles.statusOn : styles.statusPending}><span /> {isVerified ? "Verified Status" : profile.verificationStatus}</span>
          </div>
          <div className={styles.documents}>
            {documentTypes.map(([type, label]) => {
              const document = documentByType.get(type);
              return (
                <button className={styles.document} key={type} type="button" onClick={() => document && setSelectedDocument(document)}>
                  <strong>{label}</strong>
                  <div className={styles.documentPreview}>
                    {document?.url ? <img src={document.url} alt={`${label} preview`} /> : <div className={styles.documentPlaceholder}><LockKeyhole size={18} /><span>Not submitted</span></div>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className={styles.securityNote}><LockKeyhole size={11} /><span>Your sensitive data is encrypted and stored securely according to our privacy policy. Only verified admin staff can access these documents during audit processes.</span></div>
        </section>
      </div>

      {selectedDocument && (
        <div className={styles.modalBg} onClick={() => setSelectedDocument(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelectedDocument(null)} aria-label="Close preview"><X size={15} /></button>
            <h3>{labelFromType(selectedDocument.type)}</h3>
            <div className={styles.modalPreview}><img src={selectedDocument.url} alt="Verification document" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, icon, fullWidth }) {
  return <div className={`${styles.detail} ${fullWidth ? styles.fullWidth : ""}`}><small>{label}</small><strong>{icon}{value}</strong></div>;
}

function labelFromType(type) {
  return documentTypes.find(([value]) => value === type)?.[1] || "Document";
}
