"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dumbbell,
  Footprints,
  Home,
  LoaderCircle,
  PawPrint,
  Plus,
  Scissors,
  Trash2,
  X,
} from "lucide-react";
import styles from "./availability.module.css";

const WEEK_DAYS = [
  { weekday: 1, name: "Monday", short: "Mon" },
  { weekday: 2, name: "Tuesday", short: "Tue" },
  { weekday: 3, name: "Wednesday", short: "Wed" },
  { weekday: 4, name: "Thursday", short: "Thu" },
  { weekday: 5, name: "Friday", short: "Fri" },
  { weekday: 6, name: "Saturday", short: "Sat" },
  { weekday: 0, name: "Sunday", short: "Sun" },
];

const serviceIcons = {
  "Pet Sitting": PawPrint,
  "Pet Boarding": Home,
  "Pet Training": Dumbbell,
  "Pet Grooming": Scissors,
  "Dog Walking": Footprints,
};

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultSchedule() {
  return WEEK_DAYS.map(({ weekday }) => ({
    weekday,
    isAvailable: weekday !== 0,
    slots: [{ startTime: "09:00", endTime: "17:00" }],
  }));
}

function minutes(value) {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

async function responseData(response, fallback) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || fallback);
  return data;
}

export default function ManageAvailabilityPage() {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [overrides, setOverrides] = useState({});
  const [boardingCapacity, setBoardingCapacity] = useState(2);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [dateModal, setDateModal] = useState(null);
  const [dateStatus, setDateStatus] = useState("regular");
  const [dateSlots, setDateSlots] = useState([]);
  const [dateReason, setDateReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) || null,
    [services, selectedServiceId],
  );
  const isBoarding = Boolean(selectedService && /boarding/i.test(selectedService.name));

  async function loadAvailability() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/sitter/availability", { cache: "no-store" });
      const data = await responseData(response, "Unable to load availability.");
      const activeServices = data.services || [];
      setServices(activeServices);
      setOverrides(data.overrides || {});
      setConfirmedBookings(data.confirmedBookings || []);
      setBoardingCapacity(data.boardingCapacity?.[activeServices[0]?.id] || 2);

      if (activeServices.length) {
        setSelectedServiceId((current) =>
          activeServices.some((service) => service.id === current)
            ? current
            : activeServices[0].id,
        );
      }
    } catch (reason) {
      setError(reason.message || "Unable to load availability.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadAvailability, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;
    const loadFromResponse = async () => {
      try {
        const response = await fetch("/api/sitter/availability", { cache: "no-store" });
        const data = await responseData(response, "Unable to load availability.");
        setSchedule(data.schedules?.[selectedServiceId] || defaultSchedule());
        setOverrides(data.overrides || {});
        setConfirmedBookings(data.confirmedBookings || []);
        setBoardingCapacity(data.boardingCapacity?.[selectedServiceId] || 2);
      } catch (reason) {
        setError(reason.message || "Unable to load availability.");
      }
    };
    loadFromResponse();
  }, [selectedServiceId]);

  function updateDay(weekday, updates) {
    setSchedule((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...updates } : day)),
    );
  }

  function updateSlot(weekday, index, field, value) {
    setSchedule((current) =>
      current.map((day) => {
        if (day.weekday !== weekday) return day;
        return {
          ...day,
          slots: day.slots.map((slot, slotIndex) =>
            slotIndex === index ? { ...slot, [field]: value } : slot,
          ),
        };
      }),
    );
  }

  function addSlot(weekday) {
    setSchedule((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              slots: [...day.slots, { startTime: "09:00", endTime: "17:00" }],
            }
          : day,
      ),
    );
  }

  function removeSlot(weekday, index) {
    setSchedule((current) =>
      current.map((day) =>
        day.weekday === weekday
          ? { ...day, slots: day.slots.filter((_, slotIndex) => slotIndex !== index) }
          : day,
      ),
    );
  }

  function validateSchedule() {
    for (const day of schedule) {
      if (!day.isAvailable) continue;
      if (!day.slots.length) {
        return `${WEEK_DAYS.find((item) => item.weekday === day.weekday)?.name} needs at least one time slot.`;
      }
      const sorted = [...day.slots].sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
      for (let index = 0; index < sorted.length; index += 1) {
        const slot = sorted[index];
        if (!slot.startTime || !slot.endTime || minutes(slot.endTime) <= minutes(slot.startTime)) {
          return `${WEEK_DAYS.find((item) => item.weekday === day.weekday)?.name} has an invalid time range.`;
        }
        if (index > 0 && minutes(slot.startTime) < minutes(sorted[index - 1].endTime)) {
          return `${WEEK_DAYS.find((item) => item.weekday === day.weekday)?.name} time slots overlap.`;
        }
      }
    }
    return "";
  }

  async function saveAvailability() {
    if (!selectedServiceId) return;
    const validation = validateSchedule();
    if (validation) {
      setScheduleError(validation);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    setScheduleError("");
    try {
      const overrideList = (overrides[selectedServiceId] || [])
        .filter((override) => override.isAvailable !== null)
        .map((override) => ({
          date: override.date,
          isAvailable: override.isAvailable,
          slots: override.slots || [],
          reason: override.reason || "",
        }));

      const response = await fetch("/api/sitter/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          days: schedule,
          overrides: overrideList,
          boardingCapacity: isBoarding ? boardingCapacity : undefined,
        }),
      });
      const data = await responseData(response, "Unable to save availability.");
      setMessage(data.message || "Availability saved successfully.");
    } catch (reason) {
      setError(reason.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  }

  function openDateModal(date) {
    const key = dateKey(date);
    const existing = (overrides[selectedServiceId] || []).find((item) => item.date === key);
    const weekday = date.getDay();
    const regular = schedule.find((day) => day.weekday === weekday);
    setDateModal(key);
    setDateStatus(existing ? (existing.isAvailable ? "available" : "unavailable") : "regular");
    setDateSlots(
      existing?.slots?.length
        ? existing.slots
        : regular?.slots?.map((slot) => ({ ...slot })) || [{ startTime: "09:00", endTime: "17:00" }],
    );
    setDateReason(existing?.reason || "");
  }

  function updateDateSlot(index, field, value) {
    setDateSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, [field]: value } : slot)),
    );
  }

  function applyDateOverride() {
    if (!dateModal || !selectedServiceId) return;
    if (dateStatus === "available") {
      const sorted = [...dateSlots].sort((a, b) => minutes(a.startTime) - minutes(b.startTime));
      for (let index = 0; index < sorted.length; index += 1) {
        if (!sorted[index].startTime || !sorted[index].endTime || minutes(sorted[index].endTime) <= minutes(sorted[index].startTime)) {
          setScheduleError("Custom date hours contain an invalid time range.");
          return;
        }
        if (index > 0 && minutes(sorted[index].startTime) < minutes(sorted[index - 1].endTime)) {
          setScheduleError("Custom date time slots overlap.");
          return;
        }
      }
      if (!sorted.length) {
        setScheduleError("Add at least one time slot.");
        return;
      }
    }

    setOverrides((current) => {
      const next = [...(current[selectedServiceId] || [])];
      const index = next.findIndex((item) => item.date === dateModal);
      const override =
        dateStatus === "regular"
          ? null
          : {
              date: dateModal,
              isAvailable: dateStatus === "available",
              slots: dateStatus === "available" ? dateSlots : [],
              reason: dateReason,
            };
      if (override && index >= 0) next[index] = override;
      else if (override) next.push(override);
      else if (index >= 0) next.splice(index, 1);
      return { ...current, [selectedServiceId]: next };
    });
    setScheduleError("");
    setDateModal(null);
  }

  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [month]);

  function overrideFor(date) {
    return (overrides[selectedServiceId] || []).find((item) => item.date === dateKey(date));
  }

  function isRegularAvailable(date) {
    return schedule.find((day) => day.weekday === date.getDay())?.isAvailable ?? false;
  }

  function bookingCountFor(date) {
    const key = dateKey(date);
    return confirmedBookings.filter((booking) => {
      if (booking.serviceId !== selectedServiceId) return false;
      if (!booking.startDate) return false;
      const end = booking.endDate || booking.startDate;
      return key >= booking.startDate && key <= end;
    }).length;
  }

  const monthLabel = month.toLocaleDateString("en-LK", { month: "long", year: "numeric" });
  const todayKey = dateKey(new Date());

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <header className={styles.pageHeader}>
          <div className={styles.headingRow}>
            <Link href="/sitter/services" className={styles.backButton} aria-label="Back to My Services">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <p className={styles.eyebrow}>Schedule settings</p>
              <h1>Manage Availability</h1>
              <p>Manage your working hours and available dates for each service.</p>
            </div>
          </div>
        </header>

        {error && (
          <div className={styles.alertError} role="alert">
            <span><AlertCircle size={16} />{error}</span>
            <button type="button" onClick={loadAvailability}>Try again</button>
          </div>
        )}
        {message && (
          <div className={styles.alertSuccess} role="status">
            <Check size={16} />
            {message}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState} aria-label="Loading availability">
            <LoaderCircle size={20} className={styles.spinner} />
            Loading availability…
          </div>
        ) : services.length === 0 ? (
          <div className={styles.emptyState}>
            <PawPrint size={28} />
            <h2>No active services</h2>
            <p>Activate a service and set its price in My Services before managing availability.</p>
            <Link href="/sitter/services">Go to My Services</Link>
          </div>
        ) : (
          <>
            <section className={styles.serviceSection} aria-label="Active services">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionEyebrow}>Selected service</p>
                  <h2>Active Services</h2>
                </div>
              </div>
              <div className={styles.serviceGrid}>
                {services.map((service) => {
                  const Icon = serviceIcons[service.name] || PawPrint;
                  const active = service.id === selectedServiceId;
                  return (
                    <button
                      type="button"
                      key={service.id}
                      className={`${styles.serviceCard} ${active ? styles.serviceActive : ""}`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <span className={styles.serviceIcon}><Icon size={20} /></span>
                      <span className={styles.serviceDetails}>
                        <strong>{service.name}</strong>
                        <small>LKR {Number(service.price).toLocaleString("en-LK")} / session</small>
                      </span>
                      {active && <Check size={16} className={styles.serviceCheck} />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Weekly schedule</p>
                  <h2>Weekly Availability</h2>
                  <p>Set the working hours for {selectedService?.name}.</p>
                </div>
                {isBoarding && (
                  <div className={styles.capacityControl}>
                    <label htmlFor="boarding-capacity">Maximum boarding capacity</label>
                    <div>
                      <button type="button" onClick={() => setBoardingCapacity((value) => Math.max(1, value - 1))}>−</button>
                      <input
                        id="boarding-capacity"
                        type="number"
                        min="1"
                        max="100"
                        value={boardingCapacity}
                        onChange={(event) => setBoardingCapacity(Math.max(1, Math.min(100, Number(event.target.value) || 1)))}
                      />
                      <button type="button" onClick={() => setBoardingCapacity((value) => Math.min(100, value + 1))}>+</button>
                    </div>
                  </div>
                )}
              </div>

              {isBoarding ? (
                <div className={styles.boardingNotice}>
                  <Home size={16} />
                  Boarding uses check-in and check-out dates. Hourly time slots are not required.
                </div>
              ) : null}

              <div className={styles.scheduleList}>
                {WEEK_DAYS.map((day) => {
                  const value = schedule.find((item) => item.weekday === day.weekday) || {
                    weekday: day.weekday,
                    isAvailable: false,
                    slots: [{ startTime: "09:00", endTime: "17:00" }],
                  };
                  return (
                    <div
                      key={day.weekday}
                      className={`${styles.dayRow} ${value.isAvailable ? styles.dayAvailable : styles.dayUnavailable}`}
                    >
                      <div className={styles.dayIdentity}>
                        <strong>{day.name}</strong>
                        <span>{value.isAvailable ? "Available" : "Unavailable"}</span>
                      </div>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={value.isAvailable}
                          onChange={(event) => updateDay(day.weekday, { isAvailable: event.target.checked })}
                        />
                        <span />
                      </label>
                      {value.isAvailable && !isBoarding ? (
                        <div className={styles.slots}>
                          {value.slots.map((slot, index) => (
                            <div className={styles.slotRow} key={`${day.weekday}-${index}`}>
                              <Clock3 size={15} />
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(event) => updateSlot(day.weekday, index, "startTime", event.target.value)}
                                aria-label={`${day.name} start time ${index + 1}`}
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(event) => updateSlot(day.weekday, index, "endTime", event.target.value)}
                                aria-label={`${day.name} end time ${index + 1}`}
                              />
                              <button
                                type="button"
                                className={styles.removeSlot}
                                onClick={() => removeSlot(day.weekday, index)}
                                disabled={value.slots.length === 1}
                                aria-label={`Remove ${day.name} time slot ${index + 1}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))}
                          <button type="button" className={styles.addSlot} onClick={() => addSlot(day.weekday)}>
                            <Plus size={14} /> Add time slot
                          </button>
                        </div>
                      ) : (
                        <p className={styles.dayClosed}>No working hours</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {scheduleError && <p className={styles.scheduleError}>{scheduleError}</p>}
              <div className={styles.saveRow}>
                <button type="button" className={styles.saveButton} onClick={saveAvailability} disabled={saving}>
                  {saving ? <LoaderCircle size={16} className={styles.spinner} /> : <CalendarDays size={16} />}
                  {saving ? "Saving..." : "Save Weekly Schedule"}
                </button>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Date overrides</p>
                  <h2>Availability Calendar</h2>
                  <p>Select a date to block it or set custom hours.</p>
                </div>
                <div className={styles.calendarLegend} aria-label="Calendar legend">
                  <span><i className={styles.legendRegular} />Regular</span>
                  <span><i className={styles.legendAvailable} />Available</span>
                  <span><i className={styles.legendUnavailable} />Unavailable</span>
                </div>
              </div>
              <div className={styles.calendarToolbar}>
                <button type="button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Previous month">
                  <ChevronLeft size={18} />
                </button>
                <strong>{monthLabel}</strong>
                <button type="button" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Next month">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className={styles.calendarGrid}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span className={styles.weekName} key={day}>{day}</span>
                ))}
                {calendarDays.map((date) => {
                  const key = dateKey(date);
                  const outside = date.getMonth() !== month.getMonth();
                  const existing = overrideFor(date);
                  const regular = isRegularAvailable(date);
                  const statusClass = existing
                    ? existing.isAvailable
                      ? styles.dateAvailable
                      : styles.dateUnavailable
                    : regular
                      ? styles.dateRegular
                      : styles.dateUnavailable;
                  const bookings = isBoarding ? bookingCountFor(date) : 0;
                  return (
                    <button
                      type="button"
                      key={key}
                      className={`${styles.dateButton} ${outside ? styles.dateOutside : ""} ${statusClass} ${key === todayKey ? styles.dateToday : ""}`}
                      onClick={() => openDateModal(date)}
                      aria-label={`${date.toLocaleDateString("en-LK", { dateStyle: "full" })}${existing ? (existing.isAvailable ? ", available override" : ", unavailable") : regular ? ", regularly available" : ", unavailable"}`}
                    >
                      <span>{date.getDate()}</span>
                      {bookings > 0 && <small>{bookings} booked</small>}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      {dateModal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDateModal(null);
          }}
        >
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="date-modal-title">
            <button type="button" className={styles.modalClose} onClick={() => setDateModal(null)} aria-label="Close date settings">
              <X size={18} />
            </button>
            <p className={styles.modalEyebrow}>Date settings</p>
            <h2 id="date-modal-title">
              {new Date(`${dateModal}T00:00:00`).toLocaleDateString("en-LK", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h2>
            <div className={styles.statusOptions}>
              <button type="button" className={dateStatus === "regular" ? styles.statusActive : ""} onClick={() => setDateStatus("regular")}>Regular schedule</button>
              <button type="button" className={dateStatus === "available" ? styles.statusActive : ""} onClick={() => setDateStatus("available")}>Available</button>
              <button type="button" className={dateStatus === "unavailable" ? styles.statusActive : ""} onClick={() => setDateStatus("unavailable")}>Unavailable</button>
            </div>

            {dateStatus === "available" && !isBoarding && (
              <div className={styles.dateSlots}>
                <label>Custom working hours</label>
                {dateSlots.map((slot, index) => (
                  <div className={styles.slotRow} key={index}>
                    <Clock3 size={15} />
                    <input type="time" value={slot.startTime} onChange={(event) => updateDateSlot(index, "startTime", event.target.value)} />
                    <span>to</span>
                    <input type="time" value={slot.endTime} onChange={(event) => updateDateSlot(index, "endTime", event.target.value)} />
                    <button type="button" onClick={() => setDateSlots((current) => current.filter((_, slotIndex) => slotIndex !== index))} disabled={dateSlots.length === 1} aria-label="Remove custom time slot">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <button type="button" className={styles.addSlot} onClick={() => setDateSlots((current) => [...current, { startTime: "09:00", endTime: "17:00" }])}>
                  <Plus size={14} /> Add time slot
                </button>
              </div>
            )}

            {dateStatus === "unavailable" && (
              <label className={styles.reasonField}>
                Reason <span>optional</span>
                <input value={dateReason} onChange={(event) => setDateReason(event.target.value)} maxLength="255" placeholder="Holiday, personal day…" />
              </label>
            )}

            {isBoarding && (
              <p className={styles.modalBoardingNote}>
                {dateStatus === "unavailable"
                  ? "This date and the overnight stays that include it will remain unavailable."
                  : "Boarding stays use check-in and check-out dates."}
              </p>
            )}

            {scheduleError && <p className={styles.modalError}>{scheduleError}</p>}
            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setDateModal(null)}>Cancel</button>
              <button type="button" className={styles.saveButton} onClick={applyDateOverride}>Apply Date Settings</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
