"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Clock3,
  Edit3,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
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
  verificationStatus: "Loading",
  experienceYears: 0,
  avgRating: 0,
  earningTotal: 0,
  services: [],
  documents: [],
  stats: {
    serviceCount: 0,
    documentCount: 0,
    verificationCompletion: 0,
    profileCompleteness: 0,
  },
};

const money = (value) =>
  `LKR ${Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

export default function SitterProfilePage() {
  const [profile, setProfile] = useState(fallbackProfile);
  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);
  const [error, setError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/sitter/profile")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || body.message || "Unable to load your profile.");
        }

        return body.profile || body.data || body;
      })
      .then((result) => {
        if (mounted && result) {
          setProfile({ ...fallbackProfile, ...result });
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Unable to load your profile.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

      if (!response.ok) {
        throw new Error(body.error || body.message || "Unable to update preferences.");
      }

      if (body.profile || body.data) {
        setProfile({ ...fallbackProfile, ...(body.profile || body.data) });
      }
    } catch (err) {
      setProfile((current) => ({ ...current, notificationsEnabled: !nextValue }));
      setError(err.message || "Unable to update preferences.");
    } finally {
      setSavingPreference(false);
    }
  }

  const completion = Math.max(0, Math.min(100, profile.stats?.profileCompleteness ?? 0));

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topbar}>
          <Link href="/sitter" className={styles.back} aria-label="Back to dashboard">
            <ArrowLeft size={15} />
          </Link>
          <Link href="/sitter/Profile/edit" className={styles.editButton}>
            <Edit3 size={13} />
            Edit profile
          </Link>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <div className={styles.avatarShell}>
              <div className={styles.avatar}>
                <span>{initials(profile.fullName)}</span>
                <i>
                  <Camera size={10} />
                </i>
              </div>
            </div>

            <div className={styles.heroBody}>
              <div className={styles.statusRow}>
                <span className={profile.isVerified ? styles.verified : styles.pending}>
                  <ShieldCheck size={10} />
                  {profile.verificationStatus || "Pending"}
                </span>
                <span className={styles.ghostBadge}>
                  <Sparkles size={10} />
                  {profile.experienceYears ? `${profile.experienceYears}+ years` : "Profile active"}
                </span>
              </div>

              <h1>{loading ? "Loading your profile..." : profile.fullName}</h1>
              <p className={styles.subtitle}>{profile.professionalTitle || "Pet care professional"}</p>

              <div className={styles.metaRow}>
                <span>
                  <Mail size={11} />
                  {profile.email || "No email set"}
                </span>
                <span>
                  <Phone size={11} />
                  {profile.phone || "No phone set"}
                </span>
                <span>
                  <MapPin size={11} />
                  {profile.serviceArea || "Add your city"}
                </span>
              </div>

              <p className={styles.bio}>{profile.bio || "Add a short bio so pet owners understand your care style and experience."}</p>

              <div className={styles.chips}>
                {(profile.services || []).length ? (
                  profile.services.map((service) => (
                    <span key={service} className={styles.chip}>
                      {service}
                    </span>
                  ))
                ) : (
                  <span className={styles.chipMuted}>No active services yet</span>
                )}
              </div>
            </div>
          </div>

          <aside className={styles.heroSide}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHead}>
                <div>
                  <small>Profile health</small>
                  <strong>{completion}% complete</strong>
                </div>
                <div className={styles.summaryMetric}>
                  <Star size={12} />
                  {Number(profile.avgRating || 0).toFixed(1)}
                </div>
              </div>

              <div className={styles.progressTrack} aria-hidden="true">
                <span style={{ width: `${completion}%` }} />
              </div>

              <div className={styles.profileFacts}>
                <div>
                  <small>Active services</small>
                  <strong>{profile.stats?.serviceCount ?? 0}</strong>
                </div>
                <div>
                  <small>Documents</small>
                  <strong>{profile.stats?.documentCount ?? 0}</strong>
                </div>
                <div>
                  <small>Earnings</small>
                  <strong>{money(profile.earningTotal)}</strong>
                </div>
              </div>

              <button className={styles.preferenceToggle} onClick={toggleNotifications} disabled={savingPreference}>
                <span>
                  <b>Notifications</b>
                  <small>{profile.notificationsEnabled ? "Enabled for bookings" : "Muted for bookings"}</small>
                </span>
                <i className={profile.notificationsEnabled ? styles.switchOn : styles.switchOff}>
                  <em />
                </i>
              </button>

              <Link href="/sitter/services" className={styles.inlineLink}>
                Manage services
                <ChevronRight size={12} />
              </Link>
            </div>
          </aside>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.columns}>
          <div className={styles.leftColumn}>
            <section className={styles.panel}>
              <PanelHeader
                icon={<UserRound size={13} />}
                title="Professional details"
                text="The contact and location data shown to pet parents."
              />

              <div className={styles.detailGrid}>
                <DetailCard label="Phone number" value={profile.phone || "Not set"} />
                <DetailCard label="City / service area" value={profile.serviceArea || "Not set"} />
                <DetailCard label="Address" value={profile.address || "Not set"} fullWidth />
                <DetailCard label="Professional title" value={profile.professionalTitle || "Pet Sitter"} />
                <DetailCard label="Average rating" value={Number(profile.avgRating || 0).toFixed(1)} />
                <DetailCard label="Experience" value={profile.experienceYears ? `${profile.experienceYears} years` : "Add experience"} />
              </div>
            </section>

            <section className={styles.panel}>
              <PanelHeader
                icon={<LockKeyhole size={13} />}
                title="Identity verification"
                text="Verified documents are pulled from your secure profile storage."
              />

              <div className={styles.documents}>
                {(profile.documents || []).length ? (
                  profile.documents.map((document) => (
                    <button
                      key={document.type}
                      type="button"
                      className={styles.documentCard}
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className={styles.documentPreview}>
                        {document.url ? (
                          <img src={document.url} alt={`${document.type} preview`} />
                        ) : (
                          <div className={styles.documentEmpty}>
                            <ShieldCheck size={14} />
                            <span>Pending</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.documentMeta}>
                        <strong>{labelFromType(document.type)}</strong>
                        <small>{document.submittedAt ? new Date(document.submittedAt).toLocaleDateString() : "No date available"}</small>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <ShieldCheck size={16} />
                    <div>
                      <strong>No verification documents yet</strong>
                      <p>Use the edit screen to upload identity documents and complete verification.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className={styles.rightColumn}>
            <section className={styles.panel}>
              <PanelHeader
                icon={<Clock3 size={13} />}
                title="Account snapshot"
                text="A quick view of the state of your sitter profile."
              />

              <div className={styles.snapshotList}>
                <SnapshotRow label="Verification" value={profile.verificationStatus || "Pending"} />
                <SnapshotRow label="Documents ready" value={`${profile.stats?.documentCount ?? 0}/3`} />
                <SnapshotRow label="Profile completeness" value={`${completion}%`} />
                <SnapshotRow label="Verification completion" value={`${profile.stats?.verificationCompletion ?? 0}%`} />
              </div>

              <div className={styles.trustCard}>
                <ShieldCheck size={18} />
                <div>
                  <strong>Trust &amp; safety</strong>
                  <p>
                    Your profile data and identity documents are protected and only surfaced to authorized reviewers.
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <PanelHeader
                icon={<Mail size={13} />}
                title="Preferred contact"
                text="This is what owners use when they need to reach you quickly."
              />

              <div className={styles.contactCard}>
                <strong>{profile.email || "No email set"}</strong>
                <p>{profile.phone || "No phone number available"}</p>
                <Link href="/sitter/Profile/edit" className={styles.contactLink}>
                  Review profile fields
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>

      {selectedDocument && (
        <div className={styles.modalBg} onClick={() => setSelectedDocument(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <button className={styles.close} onClick={() => setSelectedDocument(null)} aria-label="Close preview">
              <X size={15} />
            </button>
            <h3>{labelFromType(selectedDocument.type)}</h3>
            <p>{selectedDocument.submittedAt ? `Submitted ${new Date(selectedDocument.submittedAt).toLocaleDateString()}` : "Document preview"}</p>
            <div className={styles.modalPreview}>
              {selectedDocument.url ? <img src={selectedDocument.url} alt={`${selectedDocument.type} preview`} /> : <ShieldCheck size={30} />}
            </div>
            <button className={styles.modalButton} onClick={() => setSelectedDocument(null)}>
              Close preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PanelHeader({ icon, title, text }) {
  return (
    <div className={styles.panelHead}>
      <div className={styles.panelTitle}>
        <span>{icon}</span>
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ label, value, fullWidth = false }) {
  return (
    <div className={`${styles.detailCard} ${fullWidth ? styles.fullWidth : ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className={styles.snapshotRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PS";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function labelFromType(type) {
  if (type === "nic_front") return "NIC Front";
  if (type === "nic_back") return "NIC Back";
  if (type === "selfie_with_nic") return "Selfie with NIC";
  return type || "Document";
}