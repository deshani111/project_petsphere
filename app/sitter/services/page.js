"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Dumbbell,
  Footprints,
  Home,
  LoaderCircle,
  PawPrint,
  Pencil,
  Scissors,
  X,
} from "lucide-react";
import styles from "./services.module.css";

const SERVICE_CATALOG = [
  {
    key: "sitting",
    name: "Pet Sitting",
    aliases: [],
    description: "Daytime companionship, feeding, and attentive care at home.",
    icon: PawPrint,
  },
  {
    key: "boarding",
    name: "Pet Boarding",
    aliases: [],
    description: "A safe, comfortable stay with care throughout the day and night.",
    icon: Home,
  },
  {
    key: "training",
    name: "Pet Training",
    aliases: ["Training Session"],
    description: "Positive guidance for obedience, manners, and better routines.",
    icon: Dumbbell,
  },
  {
    key: "grooming",
    name: "Pet Grooming",
    aliases: ["Grooming Session"],
    description: "Bathing, brushing, and gentle grooming for a healthier coat.",
    icon: Scissors,
  },
  {
    key: "walking",
    name: "Dog Walking",
    aliases: [],
    description: "Reliable walks tailored to your dog's pace and energy.",
    icon: Footprints,
  },
];

function emptyServices() {
  return Object.fromEntries(
    SERVICE_CATALOG.map((service) => [
      service.key,
      { id: null, selected: false, price: "" },
    ]),
  );
}

function servicesFromResponse(rows) {
  const next = emptyServices();
  rows.forEach((row) => {
    const service = SERVICE_CATALOG.find(
      (item) => item.name === row.name || item.aliases.includes(row.name),
    );
    if (!service) return;
    next[service.key] = {
      id: row.id,
      selected: Boolean(row.active),
      price: Number(row.price) > 0 ? String(row.price) : "",
    };
  });
  return next;
}

async function responseData(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export default function MyServicesPage() {
  const [services, setServices] = useState(emptyServices);
  const [loading, setLoading] = useState(true);
  const [pendingKey, setPendingKey] = useState("");
  const [modal, setModal] = useState(null);
  const [modalPrice, setModalPrice] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalSaving, setModalSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const priceInputRef = useRef(null);

  const selectedCount = useMemo(
    () => Object.values(services).filter((service) => service.selected).length,
    [services],
  );

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/sitter/services", {
        cache: "no-store",
      });
      const data = await responseData(
        response,
        "Unable to load your services.",
      );
      setServices(servicesFromResponse(data.services || []));
    } catch (reason) {
      setError(reason.message || "Unable to load your services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadServices, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modal) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !modalSaving) {
        setModal(null);
        setModalPrice("");
        setModalError("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const timer = window.setTimeout(() => priceInputRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [modal, modalSaving]);

  function openModal(service) {
    setModal(service);
    setModalPrice(services[service.key].price);
    setModalError("");
    setMessage("");
  }

  function closeModal() {
    if (modalSaving) return;
    setModal(null);
    setModalPrice("");
    setModalError("");
  }

  async function saveModalPrice(event) {
    event.preventDefault();
    const price = Number(modalPrice);
    if (!modalPrice || !Number.isFinite(price) || price <= 0) {
      setModalError("Enter a price greater than Rs. 0.");
      return;
    }

    const current = services[modal.key];
    setModalSaving(true);
    setModalError("");
    setError("");
    try {
      const body = {
        name: modal.name,
        description: modal.description,
        price,
        unit: "session",
        active: true,
      };
      const response = current.id
        ? await fetch(`/api/sitter/services/${current.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/sitter/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await responseData(response, `Unable to save ${modal.name}.`);
      const nextId = data.service?.id || current.id;
      setServices((currentServices) => ({
        ...currentServices,
        [modal.key]: { id: nextId, selected: true, price: String(price) },
      }));
      setMessage(`${modal.name} is now active at LKR ${price.toLocaleString("en-LK")}.`);
      setModal(null);
      setModalPrice("");
    } catch (reason) {
      setModalError(reason.message || `Unable to save ${modal.name}.`);
    } finally {
      setModalSaving(false);
    }
  }

  async function toggleService(service, checked) {
    const current = services[service.key];
    if (checked) {
      openModal(service);
      return;
    }

    if (!current.id) return;
    setPendingKey(service.key);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/sitter/services/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      await responseData(response, `Unable to turn off ${service.name}.`);
      setServices((currentServices) => ({
        ...currentServices,
        [service.key]: { ...currentServices[service.key], selected: false },
      }));
      setMessage(`${service.name} is turned off.`);
    } catch (reason) {
      setError(reason.message || `Unable to turn off ${service.name}.`);
    } finally {
      setPendingKey("");
    }
  }

  const ModalIcon = modal?.icon;

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Your offerings</p>
            <h1>My Services</h1>
            <p className={styles.subtitle}>
              Choose the care you provide and set a clear price for every session.
            </p>
          </div>
          <div className={styles.summary} aria-label={`${selectedCount} active services`}>
            <span className={styles.summaryIcon}>
              <PawPrint size={18} />
            </span>
            <strong>{selectedCount}</strong>
            <span>active services</span>
          </div>
        </header>

        <div className={styles.utilityRow}>
          <div>
            <h2>Services you offer</h2>
            <p>Turn on a service to add or update its price per session.</p>
          </div>
          <Link
            href="/sitter/services/availability"
            className={styles.availabilityLink}
          >
            <CalendarDays size={16} />
            Manage availability
          </Link>
        </div>

        {error && (
          <div className={styles.alertError} role="alert">
            <span><AlertCircle size={16} />{error}</span>
            <button type="button" onClick={loadServices}>Try again</button>
          </div>
        )}
        {message && (
          <div className={styles.alertSuccess} role="status">
            <Check size={16} />
            {message}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingGrid} aria-label="Loading services">
            {SERVICE_CATALOG.map((service) => (
              <div className={styles.loadingCard} key={service.key} />
            ))}
          </div>
        ) : (
          <section className={styles.servicesGrid} aria-label="Available services">
            {SERVICE_CATALOG.map((service) => {
              const value = services[service.key];
              const Icon = service.icon;
              const isPending = pendingKey === service.key;
              return (
                <article
                  className={`${styles.serviceCard} ${value.selected ? styles.selected : ""}`}
                  key={service.key}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.serviceIcon}>
                      <Icon size={22} strokeWidth={1.8} />
                    </span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={value.selected}
                        disabled={isPending}
                        onChange={(event) => toggleService(service, event.target.checked)}
                        aria-label={`${value.selected ? "Turn off" : "Turn on"} ${service.name}`}
                      />
                      <span aria-hidden="true" />
                      <b>{isPending ? "Updating" : value.selected ? "Active" : "Off"}</b>
                    </label>
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className={styles.cardFooter}>
                    {value.selected ? (
                      <button
                        type="button"
                        className={styles.priceSummary}
                        disabled={isPending}
                        onClick={() => openModal(service)}
                        aria-label={`Edit price for ${service.name}`}
                      >
                        <span>Price per session</span>
                        <strong>LKR {Number(value.price).toLocaleString("en-LK")}</strong>
                        <Pencil size={14} />
                      </button>
                    ) : (
                      <span className={styles.inactivePrice}>Set a price to activate</span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className={styles.footer}>
          <div>
            <strong>{selectedCount} services active</strong>
            <span>Prices are shown per one session.</span>
          </div>
          <span className={styles.footerNote}>
            Updates are saved as you manage each service.
          </span>
        </footer>
      </main>

      {modal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="price-modal-title"
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={closeModal}
              disabled={modalSaving}
              aria-label="Close price dialog"
            >
              <X size={18} />
            </button>
            <div className={styles.modalIcon}>
              <ModalIcon size={22} />
            </div>
            <p className={styles.modalEyebrow}>Service pricing</p>
            <h2 id="price-modal-title">{modal.name}</h2>
            <p className={styles.modalDescription}>
              Set the amount pet owners will pay for one session.
            </p>
            <form onSubmit={saveModalPrice}>
              <label className={styles.modalLabel} htmlFor="service-price">
                Price per Session (LKR)
              </label>
              <div className={`${styles.modalInput} ${modalError ? styles.inputInvalid : ""}`}>
                <span>LKR</span>
                <input
                  ref={priceInputRef}
                  id="service-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={modalPrice}
                  onChange={(event) => {
                    setModalPrice(event.target.value);
                    setModalError("");
                  }}
                  placeholder="0.00"
                  aria-invalid={Boolean(modalError)}
                />
              </div>
              {modalError && <p className={styles.modalError}>{modalError}</p>}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={modalSaving}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={modalSaving}>
                  {modalSaving && <LoaderCircle size={15} className={styles.spinner} />}
                  {modalSaving ? "Saving..." : "Save Price"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
