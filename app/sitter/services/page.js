"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, Footprints, Scissors, Dumbbell, Edit, Trash2, Check } from "lucide-react";
import styles from "./services.module.css";

export default function MyServicesPage() {
  const [services, setServices] = useState([]);
  const load = () => fetch("/api/sitter/services").then((r) => r.json()).then((data) => setServices((data.services || []).map((s) => ({ ...s, status: s.active ? "ACTIVE" : "INACTIVE", checked: s.active, tags: [] }))));
  useEffect(() => { load(); }, []);

  const toggleService = (id) => {
    const service = services.find((item) => item.id === id);
    fetch(`/api/sitter/services/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !service.checked }) }).then((r) => r.ok && load());
  };

  const deleteService = (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      fetch(`/api/sitter/services/${id}`, { method: "DELETE" }).then((r) => r.ok && load());
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      Home: <Home size={24} />,
      Footprints: <Footprints size={24} />,
      Scissors: <Scissors size={24} />,
      Dumbbell: <Dumbbell size={24} />
    };
    return icons[iconName];
  };

  const addService = async () => { const name = prompt("Service name:"); if (!name) return; const price = prompt("Price in LKR:", "0"); const unit = prompt("Pricing unit:", "session"); const response = await fetch("/api/sitter/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, price, unit }) }); if (response.ok) load(); };
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>My Services</h1>
            <p>Manage your offerings, rates, and active status for your pet care business.</p>
          </div>
          <Link href="/sitter/services/availability" className={styles.manageBtn}>
            📅 Manage Availability
          </Link>
        </div>

        <div className={styles.servicesList}>
          {services.map((service) => (
            <div key={service.id} className={styles.serviceCard}>
              <div className={styles.cardIcon}>
                <div className={styles.iconBox}>
                  {getIcon(service.icon)}
                </div>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.header}>
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>
                  <div className={styles.priceTag}>
                    <span className={styles.price}>Rs. {service.price}</span>
                    <span className={styles.unit}>{service.unit}</span>
                  </div>
                </div>

                <div className={styles.footer}>
                  <div className={styles.status}>
                    <button
                      className={`${styles.statusBadge} ${service.status === "ACTIVE" ? styles.active : styles.inactive}`}
                      onClick={() => toggleService(service.id)}
                    >
                      ● {service.status}
                    </button>
                    <input
                      type="checkbox"
                      checked={service.checked}
                      onChange={() => toggleService(service.id)}
                      className={styles.checkbox}
                    />
                  </div>

                  {service.tags.length > 0 && (
                    <div className={styles.tags}>
                      {service.tags.map((tag, idx) => (
                        <span key={idx} className={styles.tag}>✓ {tag}</span>
                      ))}
                    </div>
                  )}

                  <div className={styles.actions}>
                    <button className={styles.editBtn} title="Edit service">
                      <Edit size={14} />
                    </button>
                    <button className={styles.deleteBtn} onClick={() => deleteService(service.id)} title="Delete service">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className={styles.addServiceBtn} onClick={addService}>
          + Add New Service
        </button>
      </div>
    </div>
  );
}
