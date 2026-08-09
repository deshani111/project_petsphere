"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Camera, Check, ChevronRight, LockKeyhole, Mail, MapPin, Pencil, Phone, ShieldCheck, UserRound, X } from "lucide-react";
import styles from "./profile.module.css";

export default function SitterProfilePage() {
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [doc, setDoc] = useState(null);
  const [data, setData] = useState({
    phone: "+1 (555) 234-5678",
    city: "Portland, OR",
    address: "124 Maple Street, Portland, OR 97201",
    bio: "Professional pet sitter with over 8 years of experience. Certified in pet first aid and CPR. I provide a safe, loving environment for animals of all sizes and temperaments. Specialized in long walks, senior pet care, and high-energy dogs."
  });

  const change = (key, value) => setData((d) => ({ ...d, [key]: value }));

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topbar}>
          <Link href="/sitter" className={styles.back}><ArrowLeft size={15}/></Link>
          <Link href="/sitter/Profile/edit" className={styles.editButton}>
            <Pencil size={13}/> Edit Profile
          </Link>
        </div>

        <section className={styles.profileCard}>
          <div className={styles.profilePhoto}>
            <div className={styles.photo}><span>Sarah</span><b>J</b></div>
            <button className={styles.camera} aria-label="Change profile photo"><Camera size={11}/></button>
          </div>
          <div>
            <h1>Sarah Jenkins</h1>
            <a className={styles.email} href="mailto:s.jenkins.care@email.com"><Mail size={9}/> s.jenkins.care@email.com</a>
            <div className={styles.badges}><span className={styles.verified}>● VERIFIED SITTER</span><span className={styles.pro}>PRO SITTER SINCE 2021</span></div>
            <div className={styles.services}><span>Dog Walking</span><span>Pet Sitting</span><span className={styles.aid}>● Certified First Aid</span></div>
          </div>
        </section>

        <div className={styles.grid}>
          <section className={styles.details}>
            <h2><UserRound size={12}/> Professional Details</h2>
            <div className={styles.fields}>
              <Field label="PHONE NUMBER" icon={<Phone size={9}/>} value={data.phone} editing={editing} onChange={v=>change("phone",v)}/>
              <Field label="CITY" icon={<MapPin size={9}/>} value={data.city} editing={editing} onChange={v=>change("city",v)}/>
              <Field label="ADDRESS" value={data.address} editing={editing} onChange={v=>change("address",v)} full/>
            </div>
            <div className={styles.bio}><label>BIO / ABOUT</label>{editing ? <textarea value={data.bio} onChange={e=>change("bio",e.target.value)}/> : <p>{data.bio}</p>}</div>
            {editing && <button className={styles.save} onClick={()=>setEditing(false)}><Check size={12}/> Save Changes</button>}
          </section>

          <section className={styles.preferences}>
            <h2>⚙ Preferences</h2>
            <button className={styles.notify} onClick={()=>setNotifications(v=>!v)}>
              <span><b>Notifications</b><small>{notifications ? "Enabled for bookings" : "Disabled for bookings"}</small></span>
              <i className={notifications ? styles.switchOn : styles.switch}><em/></i>
            </button>
            <Link href="/sitter/services" className={styles.prefLink}>Manage services <ChevronRight size={12}/></Link>
          </section>
        </div>

        <section className={styles.identity}>
          <div className={styles.identityHead}>
            <div><h2><ShieldCheck size={13}/> Identity Verification</h2><p>Your identity has been verified by the PetSphere trust team.</p></div>
            <span className={styles.status}><Check size={9}/> Verified Status</span>
          </div>
          <div className={styles.docs}>
            <Document title="FRONT OF ID" type="front" onClick={()=>setDoc("Front of ID")}/>
            <Document title="BACK OF ID" type="back" onClick={()=>setDoc("Back of ID")}/>
            <Document title="SELFIE VERIFICATION (HOLDING ID)" type="selfie" onClick={()=>setDoc("Selfie Verification")}/>
          </div>
          <div className={styles.privacy}><LockKeyhole size={13}/><span>Your sensitive data is encrypted and stored securely according to our privacy policy. Only verified admin staff can access these documents during audit processes.</span></div>
        </section>
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

function Field({label, icon, value, editing, onChange, full}) {
  return <div className={`${styles.field} ${full ? styles.full : ""}`}><label>{icon}{label}</label>{editing ? <input value={value} onChange={e=>onChange(e.target.value)}/> : <p>{value}</p>}</div>;
}

function Document({title,type,onClick}) {
  return <button className={styles.doc} onClick={onClick}><span>{title}</span><div className={`${styles.docImage} ${styles[type]}`}><div className={styles.mock}>{type==="selfie" ? <><b>SJ</b><small>VERIFIED</small></> : <><strong>ID</strong><small>{type==="front" ? "PORTLAND" : "IDENTIFICATION"}</small></>}</div><i>View</i></div></button>;
}
