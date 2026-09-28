"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ShieldCheck,
  LockKeyhole,
  UserRound,
  MapPin,
  Phone,
  Mail,
  X,
  Upload,
} from "lucide-react";
import styles from "./edit.module.css";

const empty = { fullName: "", email: "", phone: "", city: "", address: "", bio: "" };
const documentTypes = [
  {
    type: "nic_front",
    label: "NIC Front",
    description: "Upload the front side of your NIC.",
    button: "+ Upload NIC Front",
  },
  {
    type: "nic_back",
    label: "NIC Back",
    description: "Upload the back side of your NIC.",
    button: "+ Upload NIC Back",
  },
  {
    type: "selfie_with_nic",
    label: "Selfie with NIC",
    description: "Upload a clear selfie holding your NIC.",
    button: "+ Upload Selfie",
  },
];

export default function EditProfile() {
  const [data, setData] = useState(empty);
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("Not Submitted");
  const [documents, setDocuments] = useState({});
  const [documentFiles, setDocumentFiles] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});
  const inputs = useRef({});

  useEffect(() => {
    fetch("/api/sitter/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setData({
            fullName: d.profile.fullName,
            email: d.profile.email,
            phone: d.profile.phone,
            city: d.profile.serviceArea,
            address: d.profile.address,
            bio: d.profile.bio,
          });
          setServices(d.profile.services || []);
          setVerificationStatus(d.profile.verificationStatus || "Not Submitted");
          setDocuments(
            Object.fromEntries(
              (d.profile.documents || []).map((document) => [
                document.type,
                { url: document.url, preview: document.url },
              ])
            )
          );
        }
        setLoaded(true);
      })
      .catch(() => {
        setError("Unable to load your profile.");
        setLoaded(true);
      });
  }, []);

  const change = (key, value) => setData((current) => ({ ...current, [key]: value }));

  function selectDocument(type, file) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setDocumentErrors((current) => ({
        ...current,
        [type]: "Please upload a JPG, PNG, or WEBP image.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setDocumentErrors((current) => ({ ...current, [type]: "Image must be less than 5MB." }));
      return;
    }

    setDocumentErrors((current) => ({ ...current, [type]: "" }));
    setDocumentFiles((current) => ({ ...current, [type]: file }));
    setDocuments((current) => ({
      ...current,
      [type]: { url: current[type]?.url, preview: URL.createObjectURL(file) },
    }));
  }

  async function save() {
    const names = data.fullName.trim().split(/\s+/);

    if (names.length < 2) {
      setError("Please enter your first and last name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (data.phone && !/^[+0-9()\-\s]{8,20}$/.test(data.phone)) {
      setError("Enter a valid phone number.");
      return;
    }

    const isSubmittingVerification = Object.keys(documentFiles).length > 0;
    const hasAllDocuments = documentTypes.every(({ type }) => documentFiles[type] || documents[type]?.url);

    if (isSubmittingVerification && !hasAllDocuments) {
      setError("Please upload NIC Front, NIC Back, and Selfie with NIC before saving verification.");
      return;
    }

    setSaving(true);
    setError("");

    const form = new FormData();
    form.append("firstName", names.shift());
    form.append("lastName", names.join(" "));
    form.append("email", data.email);
    form.append("phone", data.phone);
    form.append("address", data.address);
    form.append("serviceArea", data.city);
    form.append("bio", data.bio);

    documentTypes.forEach(({ type }) => {
      if (documentFiles[type]) form.append(type, documentFiles[type]);
    });

    const response = await fetch("/api/sitter/profile", { method: "PATCH", body: form });
    const result = await response.json();
    setSaving(false);

    if (response.ok) location.assign("/sitter/Profile");
    else setError(result.error || result.message || "Unable to save your profile.");
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header>
          <div>
            <h1>Edit Profile</h1>
            <p>Manage your professional identity and pet care preferences.</p>
          </div>
          <span className={styles.verified}><Check size={11}/> Verified Sitter</span>
        </header>

        <section className={styles.identity}>
          <div className={styles.avatar}>
            {data.fullName.split(" ").filter(Boolean).map((x) => x[0]).join("").slice(0, 2) || "PS"}
          </div>
          <div className={styles.formGrid}>
            <Field label="Full Name" value={data.fullName} onChange={(v) => change("fullName", v)} required/>
            <Field label="Professional Title" value="Pet Sitter & Dog Walker" readOnly/>
            <Field label="Email Address" value={data.email} onChange={(v) => change("email", v)} icon={<Mail size={11}/>} required/>
            <span className={styles.emailOk}><Check size={13}/></span>
          </div>
        </section>

        <div className={styles.columns}>
          <section className={styles.card}>
            <h2><UserRound size={13}/> Professional Details</h2>
            <div className={styles.two}>
              <Field label="Phone Number" value={data.phone} onChange={(v) => change("phone", v)} icon={<Phone size={11}/>}/>
              <Field label="City" value={data.city} onChange={(v) => change("city", v)} icon={<MapPin size={11}/>}/>
            </div>
            <Field label="Address" value={data.address} onChange={(v) => change("address", v)}/>
            <label className={styles.label}>Service Tags</label>
            <div className={styles.tags}>
              {services.map((service) => <Link key={service} href="/sitter/services">{service}<X size={10}/></Link>)}
              <Link href="/sitter/services">+ Manage Services</Link>
            </div>
          </section>

          <aside className={styles.card}>
            <h2>âš™ Preferences</h2>
            <div className={styles.notice}><b>Notifications</b><small>Alerts for new bookings</small><i><em/></i></div>
            <div className={styles.trust}><ShieldCheck size={18}/><b>Trust & Safety</b><span>Your professional details were last verified securely.</span></div>
          </aside>
        </div>

        <section className={styles.card}>
          <h2>âœŽ Bio / About</h2>
          <label className={styles.label}>Tell pet owners about your experience</label>
          <textarea value={data.bio} maxLength="2000" onChange={(e) => change("bio", e.target.value)} placeholder="Share your pet-care experience..."/>
          <small className={styles.count}>{data.bio.length}/2000</small>
        </section>

        <section className={styles.card}>
          <div className={styles.identityTitle}>
            <div>
              <h2><ShieldCheck size={13}/> Identity Verification</h2>
              <p>Upload your identity documents to verify your Pet Sitter account.</p>
            </div>
            <small>{verificationStatus}</small>
          </div>
          <div className={styles.docs}>
            {documentTypes.map((document) => (
              <VerificationUpload
                key={document.type}
                document={document}
                value={documents[document.type]}
                error={documentErrors[document.type]}
                inputRef={(node) => { inputs.current[document.type] = node; }}
                onPick={() => inputs.current[document.type]?.click()}
                onChange={(file) => selectDocument(document.type, file)}
              />
            ))}
          </div>
          <div className={styles.privacy}>
            <LockKeyhole size={14}/>
            Your identity documents are securely stored and only accessible to authorized administrators for verification.
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <footer>
          <Link href="/sitter/Profile">Cancel</Link>
          <button onClick={save} disabled={!loaded || saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, icon, readOnly, required }) {
  return (
    <label className={styles.field}>
      <span>{icon}{label}{required && <b>*</b>}</span>
      <input value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly}/>
    </label>
  );
}

function VerificationUpload({ document, value, error, inputRef, onPick, onChange }) {
  return (
    <div className={styles.uploadItem}>
      <label>{document.label}</label>
      <p>{document.description}</p>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onChange(event.target.files?.[0])}
      />
      {value?.preview ? (
        <div className={styles.previewWrap}>
          <img src={value.preview} alt={`${document.label} preview`}/>
          <button type="button" onClick={onPick}>Change</button>
        </div>
      ) : (
        <button type="button" className={styles.uploadBox} onClick={onPick}>
          <Upload size={14}/>
          <span>{document.button}</span>
        </button>
      )}
      {error && <small className={styles.validation}>{error}</small>}
    </div>
  );
}
