"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Camera, Check, X, Mail, Zap, ShieldCheck, LockKeyhole } from "lucide-react";
import styles from "../profile.module.css";

export default function EditProfilePage() {
  const [photo, setPhoto] = useState(null);
  const [services, setServices] = useState(["Dog Walking", "Pet Sitting", "Grooming"]);
  const [data, setData] = useState({
    fullName: "James Wilson",
    title: "Expert Pet Sitter & Dog Walker",
    email: "james.wilson@petsphere.com",
    phone: "+1 (555) 234-5678",
    city: "San Francisco",
    address: "324 California Avenue, Suite 201",
    bio: "Professional pet sitter with over 8 years of experience. Certified in pet first aid and CPR. I provide a safe, loving environment for animals of all sizes and temperaments. Specialized in long walks, senior pet care, and high-energy dogs."
  });
  const [notifications, setNotifications] = useState(true);
  const [doc, setDoc] = useState(null);

  const change = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPhoto(event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const addService = () => {
    const newService = prompt("Enter service name:");
    if (newService && !services.includes(newService)) {
      setServices([...services, newService]);
    }
  };

  const removeService = (service) => {
    setServices(services.filter(s => s !== service));
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topbar}>
          <Link href="/sitter/Profile" className={styles.back}><ArrowLeft size={15}/></Link>
          <p style={{fontSize: "8px", color: "#8a7e7a", margin: 0}}>Manage your professional profile. You can save your changes anytime.</p>
          <button className={styles.editButton} style={{background: "transparent", color: "#96363a", border: "1px solid #eadad8", marginLeft: "auto"}}>
            ✓ Verified Sitter
          </button>
        </div>

        <h1 style={{fontSize: "18px", marginTop: "18px", marginBottom: "3px", color: "#302929", fontWeight: "600"}}>Edit Profile</h1>

        <section className={styles.profileCard} style={{marginBottom: "14px"}}>
          <div className={styles.profilePhoto}>
            <div className={styles.photo} style={{backgroundImage: photo ? `url(${photo})` : undefined, backgroundSize: "cover", backgroundPosition: "center"}}>
              {!photo && <><span>James</span><b>W</b></>}
            </div>
            <label className={styles.camera} style={{cursor: "pointer"}}>
              <Camera size={11}/>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display: "none"}}/>
            </label>
          </div>
          <div>
            <h2 style={{fontSize: "9px", margin: "0 0 6px", color: "#8a7e7a", fontWeight: "600", letterSpacing: "0.5px"}}>UPLOAD PHOTO</h2>
            <p style={{fontSize: "7px", color: "#716767", margin: "0", lineHeight: "11px"}}>
              Upload a square image. It will be cropped to fit.
            </p>
          </div>
        </section>

        <div className={styles.grid} style={{gridTemplateColumns: "minmax(0,1fr) 159px", gap: "14px"}}>
          <section className={styles.details}>
            <div className={styles.fields} style={{gridTemplateColumns: "1fr 1fr"}}>
              <Field label="Full Name" value={data.fullName} onChange={v => change("fullName", v)}/>
              <Field label="Professional Title" value={data.title} onChange={v => change("title", v)}/>
            </div>

            <div className={styles.field} style={{gridColumn: "1/-1", marginTop: "11px"}}>
              <label><Mail size={9}/> Email Address</label>
              <div style={{display: "flex", alignItems: "center", gap: "6px", marginTop: "4px"}}>
                <input value={data.email} onChange={e => change("email", e.target.value)} style={{flex: 1}}/>
                <Check size={13} style={{color: "#26935b", flex: "none"}}/>
              </div>
            </div>

            <h2 style={{fontSize: "10px", margin: "14px 0 11px", display: "flex", gap: "5px", alignItems: "center", color: "#96363a"}}><ShieldCheck size={13}/> Professional Details</h2>
            <div className={styles.fields} style={{gridTemplateColumns: "1fr 1fr"}}>
              <Field label="Phone Number" value={data.phone} onChange={v => change("phone", v)}/>
              <Field label="City" value={data.city} onChange={v => change("city", v)}/>
            </div>
            <div className={styles.field} style={{gridColumn: "1/-1"}}>
              <label>Address</label>
              <input value={data.address} onChange={e => change("address", e.target.value)}/>
            </div>

            <div style={{marginTop: "11px"}}>
              <label style={{display: "block", color: "#8a7e7a", fontSize: "6.5px", letterSpacing: ".45px", fontWeight: "600", marginBottom: "8px"}}>SERVICE TAGS</label>
              <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
                {services.map((service) => (
                  <button
                    key={service}
                    onClick={() => removeService(service)}
                    style={{
                      padding: "5px 8px",
                      borderRadius: "99px",
                      background: "#f7e5df",
                      color: "#75605b",
                      border: "0",
                      fontSize: "7px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "0.15s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#f0d4cc"}
                    onMouseLeave={(e) => e.target.style.background = "#f7e5df"}
                    title="Click to remove"
                  >
                    {service} <X size={9}/>
                  </button>
                ))}
                <button
                  onClick={addService}
                  style={{
                    padding: "5px 8px",
                    borderRadius: "99px",
                    background: "#f7e5df",
                    color: "#75605b",
                    border: "0",
                    fontSize: "7px",
                    cursor: "pointer",
                    transition: "0.15s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#f0d4cc"}
                  onMouseLeave={(e) => e.target.style.background = "#f7e5df"}
                >
                  + Add Service
                </button>
              </div>
            </div>

            <div className={styles.bio} style={{marginTop: "11px"}}>
              <label>BIO / ABOUT</label>
              <textarea
                value={data.bio}
                onChange={e => change("bio", e.target.value)}
              />
            </div>

            <h2 style={{fontSize: "10px", margin: "14px 0 11px", display: "flex", gap: "5px", alignItems: "center", color: "#96363a"}}><ShieldCheck size={13}/> Identity Verification</h2>
            <p style={{fontSize: "7px", color: "#8a7e7a", margin: "0 0 12px"}}>Encrypted & Secure</p>
            <div className={styles.docs}>
              <Document title="FRONT OF ID" type="front" onClick={()=>setDoc("Front of ID")}/>
              <Document title="BACK OF ID" type="back" onClick={()=>setDoc("Back of ID")}/>
              <Document title="SELFIE WITH ID" type="selfie" onClick={()=>setDoc("Selfie Verification")}/>
            </div>
            <div className={styles.privacy} style={{marginTop: "12px"}}>
              <LockKeyhole size={13}/>
              <span>Your sensitive data is encrypted and stored securely according to our privacy policy. Only verified admin staff can access these documents during audit processes.</span>
            </div>
          </section>

          <section className={styles.preferences}>
            <h2>⚙ Preferences</h2>
            <button
              className={styles.notify}
              onClick={() => setNotifications(v => !v)}
            >
              <span><b>Notifications</b><small>Enabled for bookings</small></span>
              <i className={notifications ? styles.switchOn : styles.switch}><em/></i>
            </button>

            <div style={{marginTop: "12px", padding: "12px", borderRadius: "7px", background: "#f5f0ed", display: "flex", gap: "8px"}}>
              <Zap size={13} style={{color: "#96363a", flex: "none", marginTop: "1px"}}/>
              <div style={{fontSize: "7px", color: "#716767", lineHeight: "11px"}}>
                <strong style={{color: "#96363a"}}>Trust & Safety</strong>
                <p style={{margin: "3px 0 0"}}>We protect your profile information</p>
              </div>
            </div>
          </section>
        </div>

        <div style={{display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end"}}>
          <Link href="/sitter/Profile" className={styles.editButton} style={{background: "transparent", color: "#96363a", border: "1px solid #eadad8"}}>
            Cancel
          </Link>
          <button
            className={styles.editButton}
            style={{background: "#96363a"}}
          >
            <Check size={13}/> Save Changes
          </button>
        </div>
      </div>

      {doc && <div className={styles.modalBg} onClick={()=>setDoc(null)}>
        <div className={styles.modal} onClick={e=>e.stopPropagation()}>
          <button className={styles.close} onClick={()=>setDoc(null)}><X size={15}/></button>
          <ShieldCheck size={25}/>
          <h3>{doc}</h3><p>Verified document preview. This area is ready to connect to your secure document storage.</p>
          <button className={styles.modalButton} onClick={()=>setDoc(null)}>Close Preview</button>
        </div>
      </div>}
    </div>
  );
}

function Field({label, value, onChange, full}) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ""}`}>
      <label>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}

function Document({title,type,onClick}) {
  return <button className={styles.doc} onClick={onClick}><span>{title}</span><div className={`${styles.docImage} ${styles[type]}`}><div className={styles.mock}>{type==="selfie" ? <><b>JW</b><small>VERIFIED</small></> : <><strong>ID</strong><small>{type==="front" ? "CALIFORNIA" : "IDENTIFICATION"}</small></>}</div><i>View</i></div></button>;
}
