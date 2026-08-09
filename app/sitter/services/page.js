"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, Footprints, Scissors, Dumbbell, Edit, Trash2, Check } from "lucide-react";
import styles from "./services.module.css";

export default function MyServicesPage() {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Boarding",
      description: "Safe and comfortable overnight stay in my pet-friendly home.",
      price: "5000",
      unit: "/night",
      status: "ACTIVE",
      icon: "Home",
      checked: true,
      tags: ["Insurance Covered", "48h Update"]
    },
    {
      id: 2,
      name: "Dog Walking",
      description: "Energizing walks around the neighborhood or local parks.",
      price: "2500",
      unit: "/30 min walk",
      status: "ACTIVE",
      icon: "Footprints",
      checked: true,
      tags: ["Insurance Covered", "48h Update"]
    },
    {
      id: 3,
      name: "Grooming",
      description: "Bath, brush, and nail trim to keep your pet looking their best.",
      price: "4000",
      unit: "/session",
      status: "INACTIVE",
      icon: "Scissors",
      checked: false,
      tags: []
    },
    {
      id: 4,
      name: "Training",
      description: "Basic obedience and behavior training sessions.",
      price: "6000",
      unit: "/hour",
      status: "ACTIVE",
      icon: "Dumbbell",
      checked: true,
      tags: ["Insurance Covered", "48h Update"]
    }
  ]);

  const toggleService = (id) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, checked: !s.checked, status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : s
    ));
  };

  const deleteService = (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices(services.filter(s => s.id !== id));
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

        <button className={styles.addServiceBtn}>
          + Add New Service
        </button>
      </div>
    </div>
  );
}
