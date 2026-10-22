"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OwnerSidebar } from "../../../../components/owner-dashboard/owner-sidebar";
import SitterSidebar from "../../../../app/sitter/Sidebar";
import styles from "./page.module.css";

const initialForm = {
  type: "Dog",
  name: "",
  breed: "",
  age: "",
  gender: "",
  description: "",
  price: "",
  location: "",
};

const checks = [
  ["health", "Health details are accurate"],
];

export default function NewMarketplaceAdPage({ sellerRole = "pet_owner", marketplaceShell = false }) {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [care, setCare] = useState({
    vaccinated: false,
    microchipped: false,
    houseTrained: false,
    goodWithChildren: false,
    goodWithOtherPets: false,
    specialCareNeeded: false,
  });
  const [confirmed, setConfirmed] = useState({});
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("Pet Owner");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (payload?.name) setUserName(payload.name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/marketplace/ads/${editId}?mode=edit`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load this ad.");
        return response.json();
      })
      .then((ad) => {
        setForm((current) => ({
          ...current,
          type: ad.petType || current.type,
          name: ad.petName || "",
          breed: ad.breed || "",
          age: ad.age || "",
          gender: ad.gender ? `${ad.gender[0].toUpperCase()}${ad.gender.slice(1)}` : "",
          description: ad.description || "",
          price: ad.price || "",
        }));
        if (ad.care) setCare(ad.care);
      })
      .catch((error) => setNotice(error.message));
  }, [editId]);

  const requiredFields = ["name", "breed", "age", "description", "location"];
  const completedFields = requiredFields.filter((field) => form[field].trim()).length;
  const completedChecks = Object.values(confirmed).filter(Boolean).length;
  const completion = Math.round(((photos.length > 0 ? 1 : 0) + completedFields + completedChecks) / (requiredFields.length + 2) * 100);

  useEffect(() => () => photos.forEach((photo) => URL.revokeObjectURL(photo.url)), [photos]);

  const update = (event) => {
    const { name, value } = event.target;
    const shouldCapitalize = name === "name" || name === "location";
    setForm((current) => ({
      ...current,
      [name]: shouldCapitalize && value ? `${value[0].toUpperCase()}${value.slice(1)}` : value,
    }));
  };

  const addPhotos = (event) => {
    const next = Array.from(event.target.files || []).slice(0, 6 - photos.length).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos((current) => [...current, ...next]);
    event.target.value = "";
  };

  const removePhoto = (url) => {
    URL.revokeObjectURL(url);
    setPhotos((current) => current.filter((photo) => photo.url !== url));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    photos.forEach((photo) => body.append("photos", photo.file));
    Object.entries(care).forEach(([key, value]) => {
      if (value) body.append(key, "true");
    });
    try {
      const response = editId
        ? await fetch(`/api/marketplace/ads/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: form.description,
              price: form.price,
              type: form.type,
              name: form.name,
              breed: form.breed,
              age: form.age,
              gender: form.gender,
              care,
            }),
          })
        : await fetch("/api/marketplace/ads", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Could not submit your ad.");
      if (editId) {
        setNotice(payload.requiresReview
          ? `Saved. Because you changed ${payload.changedSensitiveFields.join(", ")}, your ad is back in review.`
          : "Saved. Your ad is still live.");
      } else {
        setNotice(payload.message);
      }
    } catch (error) {
      setNotice(error.message || "Could not submit your ad. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={marketplaceShell ? undefined : styles.dashboardShell}>
      {!marketplaceShell && sellerRole === "pet_sitter" ? <SitterSidebar /> : null}
      {!marketplaceShell && sellerRole !== "pet_sitter" ? <OwnerSidebar /> : null}
      <div className={marketplaceShell ? undefined : styles.dashboardMain}>
        {!marketplaceShell && <header className={styles.dashboardHeader}><Link href="/owner/dashboard" className={styles.headerUser} aria-label="Open owner dashboard"><span>{userName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "PO"}</span><b>{userName}</b></Link></header>}
        <main className={styles.page}>
          <div className={styles.shell}>
        <Link href="/marketplace" className={styles.back}><span aria-hidden="true">←</span> Marketplace</Link>
        <div className={styles.headingRow}>
          <div>
            <span className={styles.eyebrow}>Marketplace</span>
            <h1>{editId ? "Edit your listing" : "Create a listing"}</h1>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className={styles.layout}>
            <div className={styles.formColumn}>
              <section className={styles.card} aria-labelledby="photos-heading">
                <div className={styles.sectionHeading}><span className={styles.number}>01</span><div><h2 id="photos-heading">Show your pet</h2><p>Clear, recent photos help your listing stand out.</p></div><span className={styles.required}>Required</span></div>
                <label className={styles.dropzone}>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos} />
                  <span className={styles.uploadIcon}>↑</span><strong>Drop photos here or <em>browse</em></strong><small>JPG, PNG or WebP · up to 6 photos</small>
                </label>
                {!!photos.length && <div className={styles.photoGrid}>{photos.map((photo, index) => <div className={styles.photo} key={photo.url}><img src={photo.url} alt={`Listing photo ${index + 1}`} /><button type="button" onClick={() => removePhoto(photo.url)} aria-label={`Remove ${photo.name}`}>×</button>{index === 0 && <span>Cover</span>}</div>)}</div>}
              </section>

              <section className={styles.card} aria-labelledby="pet-heading">
                <div className={styles.sectionHeading}><span className={styles.number}>02</span><div><h2 id="pet-heading">Pet details</h2><p>Tell people a little about who they will meet.</p></div></div>
                <div className={styles.fields}>
                  <label>Pet type<select name="type" value={form.type} onChange={update}><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></label>
                  <label>Pet name<input name="name" value={form.name} onChange={update} placeholder="e.g. Cooper" /></label>
                  <label>Breed<input name="breed" value={form.breed} onChange={update} placeholder="e.g. Golden Retriever" /></label>
                  <label>Age<input name="age" type="number" min="0" step="any" value={form.age} onChange={update} placeholder="e.g. 3" /></label>
                  <label>Gender<select name="gender" value={form.gender} onChange={update}><option value="">Select gender</option><option>Male</option><option>Female</option></select></label>
                  <label>Location<input name="location" value={form.location} onChange={update} placeholder="City or town" /></label>
                </div>
              </section>

              <section className={styles.card} aria-labelledby="listing-heading">
                <div className={styles.sectionHeading}><span className={styles.number}>03</span><div><h2 id="listing-heading">Listing information</h2><p>Give your ad a warm, useful introduction.</p></div></div>
                <div className={styles.fields}><label className={styles.full}>Description<textarea name="description" value={form.description} onChange={update} rows={5} placeholder="What is your pet's personality like? Include routine, training, and what kind of home would suit them best." /><small className={styles.hint}>Avoid sharing private contact details here.</small></label><label>Listing price<div className={styles.priceInput}><span>Rs.</span><input name="price" value={form.price} onChange={update} inputMode="decimal" placeholder="0.00" /></div></label></div>
              </section>

              <section className={styles.card} aria-labelledby="care-heading">
                <div className={styles.sectionHeading}><span className={styles.number}>04</span><div><h2 id="care-heading">Care &amp; wellbeing</h2><p>Set expectations before someone reaches out.</p></div></div>
                <div className={styles.checkGrid}>{[
                  ["vaccinated", "Vaccinated"],
                  ["microchipped", "Microchipped"],
                  ["houseTrained", "House trained"],
                  ["goodWithChildren", "Good with children"],
                  ["goodWithOtherPets", "Good with other pets"],
                  ["specialCareNeeded", "Special care needed"],
                ].map(([key, label]) => <label key={key}><input name={key} type="checkbox" checked={care[key]} onChange={(event) => setCare((current) => ({ ...current, [key]: event.target.checked }))} /> <span>{label}</span></label>)}</div>
              </section>
            </div>

            <aside className={styles.sidebar}>
              <div className={`${styles.card} ${styles.sticky}`}>
                <div className={styles.sideTitle}><div><span className={styles.eyebrow}>Listing checklist</span><h2>Make it complete</h2></div><span className={styles.score}>{completion}%</span></div>
                <p className={styles.sideCopy}>Complete the essentials to build confidence with potential adopters.</p>
                <div className={styles.checklist}>{checks.map(([key, label]) => <label key={key}><input type="checkbox" checked={!!confirmed[key]} onChange={(event) => setConfirmed((current) => ({ ...current, [key]: event.target.checked }))} /><span className={confirmed[key] ? styles.checked : ""}>{label}</span></label>)}</div>
                <div className={styles.preview}><span className={styles.previewLabel}>Live preview</span><strong>{form.name || "Your pet's name"}</strong><p>{form.name ? `${form.name} · ${form.breed || "Pet"}` : "Pet name · Breed"}</p><small>{form.location || "Your location"}{form.price ? ` · Rs. ${form.price}` : ""}</small></div>
                {notice && <p className={styles.notice} role="status">{notice}</p>}
                <button className={styles.publish} type="submit" disabled={submitting}>{submitting ? "Submitting…" : editId ? "Edit & resubmit" : "Submit ad"} {!submitting && <span>→</span>}</button>
                <button className={styles.draft} type="button" onClick={() => setNotice("Draft saved on this device.")}>Save as draft</button>
              </div>
            </aside>
          </div>
        </form>
          </div>
        </main>
      </div>
    </div>
  );
}
