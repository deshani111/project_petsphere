"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Home, Footprints, Scissors, Dumbbell, X, Plus, Minus, Calendar, AlertCircle } from "lucide-react";
import styles from "./availability.module.css";

export default function ManageAvailabilityPage() {
  const [selectedService, setSelectedService] = useState("Boarding");
  const [availableDays, setAvailableDays] = useState({
    Mon: true,
    Tue: true,
    Wed: false,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: true
  });
  const [maxDogs, setMaxDogs] = useState(2);
  const [blockedDates, setBlockedDates] = useState([
    { date: "15 Aug 2026", reason: "Vacation" },
    { date: "22 Aug 2026", reason: "Already booked" },
    { date: "05 Sep 2026", reason: "Family event" }
  ]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newBlockedReason, setNewBlockedReason] = useState("");

  const services = [
    { name: "Boarding", icon: <Home size={18} /> },
    { name: "Dog Walking", icon: <Footprints size={18} /> },
    { name: "Grooming", icon: <Scissors size={18} /> },
    { name: "Training", icon: <Dumbbell size={18} /> }
  ];

  const toggleDay = (day) => {
    setAvailableDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const addBlockedDate = () => {
    if (newBlockedDate && newBlockedReason) {
      setBlockedDates([...blockedDates, { date: newBlockedDate, reason: newBlockedReason }]);
      setNewBlockedDate("");
      setNewBlockedReason("");
    }
  };

  const removeBlockedDate = (index) => {
    setBlockedDates(blockedDates.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.topbar}>
          <Link href="/sitter/services" className={styles.back}>
            <ArrowLeft size={15} />
          </Link>
          <h1>Manage Availability</h1>
        </div>

        <p className={styles.subtitle}>Set your available days, time slots, and blocked dates for each service</p>

        <div className={styles.serviceTabs}>
          {services.map((service) => (
            <button
              key={service.name}
              className={`${styles.tab} ${selectedService === service.name ? styles.active : ""}`}
              onClick={() => setSelectedService(service.name)}
            >
              <span className={styles.tabIcon}>{service.icon}</span>
              <span className={styles.tabLabel}>{service.name}</span>
            </button>
          ))}
        </div>

        <div className={styles.serviceDropdown}>
          <label>SERVICE</label>
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
            {services.map((service) => (
              <option key={service.name} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.sections}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>1. Set Available Days</h2>
              <p>Select the days when you are available for {selectedService.toLowerCase()} (full day).</p>
            </div>

            <div className={styles.dayGrid}>
              {Object.entries(availableDays).map(([day, isAvailable]) => (
                <button
                  key={day}
                  className={`${styles.dayBtn} ${isAvailable ? styles.selected : ""}`}
                  onClick={() => toggleDay(day)}
                >
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={() => toggleDay(day)}
                    className={styles.dayCheckbox}
                  />
                  <span>{day}</span>
                </button>
              ))}
            </div>

            <div className={styles.info}>
              <AlertCircle size={13} />
              <span>Customers will be able to book you for full day stays on the selected days.</span>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>2. Maximum Dogs Per Day</h2>
              <p>Set how many dogs you can board per day.</p>
            </div>

            <div className={styles.maxDogsControl}>
              <button
                className={styles.minusBtn}
                onClick={() => setMaxDogs(Math.max(1, maxDogs - 1))}
              >
                <Minus size={14} />
              </button>
              <span className={styles.maxDogsValue}>{maxDogs}</span>
              <button
                className={styles.plusBtn}
                onClick={() => setMaxDogs(maxDogs + 1)}
              >
                <Plus size={14} />
              </button>
              <p className={styles.hint}>You can update this anytime.</p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>3. Block Unavailable Dates (Optional)</h2>
              <p>Add dates you are unavailable (vacations, personal events, etc.).</p>
            </div>

            <button className={styles.addBlockedDateBtn} onClick={() => {
              const dateInput = prompt("Enter date (e.g., 15 Aug 2026):");
              const reasonInput = prompt("Enter reason (e.g., Vacation):");
              if (dateInput && reasonInput) {
                setNewBlockedDate(dateInput);
                setNewBlockedReason(reasonInput);
                setBlockedDates([...blockedDates, { date: dateInput, reason: reasonInput }]);
              }
            }}>
              <Plus size={13} /> Add Blocked Date
            </button>

            <div className={styles.blockedDatesList}>
              {blockedDates.map((item, idx) => (
                <div key={idx} className={styles.blockedDateItem}>
                  <div className={styles.dateInfo}>
                    <Calendar size={13} />
                    <div>
                      <p className={styles.dateText}>{item.date}</p>
                      <p className={styles.reasonText}>{item.reason}</p>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeBlockedDate(idx)}
                    title="Remove blocked date"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <p className={styles.blockedInfo}>
              Blocked dates will not be shown to customers.
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <div className={styles.warning}>
            <AlertCircle size={13} />
            <span>Changes you make will reflect on your service page immediately.</span>
          </div>
          <button className={styles.saveBtn}>
            💾 Save Availability
          </button>
        </div>
      </div>
    </div>
  );
}
