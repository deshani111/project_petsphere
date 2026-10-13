"use client";

import { useEffect, useMemo, useState } from "react";
import RevenueChart from "./components/revenue-chart";
import ServiceBookings from "./components/service-bookings";
import SummaryCard from "./components/summary-card";
import styles from "./page.module.css";

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value || 0);

export default function AdminDashboardClient({ previewData = null }) {
  const [dashboard, setDashboard] = useState(previewData);
  const [period, setPeriod] = useState("Last 30 Days");
  const [error, setError] = useState("");

  useEffect(() => {
    if (previewData) return;
    (async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        setDashboard(payload);
      } catch (loadError) {
        setError(loadError.message || "Dashboard data could not be loaded.");
      }
    })();
  }, [previewData]);

  const summary = useMemo(() => {
    if (!dashboard) return [];
    const totalUsers = (dashboard.totalPetOwners || 0) + (dashboard.totalPetSitters || 0);
    const revenue = (dashboard.revenue || []).reduce((total, payment) => total + Number(payment.amount || 0), 0);
    return [
      { label: "Total Users", value: formatNumber(totalUsers), trend: "5.2%", icon: "users" },
      { label: "Active Bookings", value: formatNumber(dashboard.totalBookings), trend: "12.8%", icon: "bookings" },
      { label: "Monthly Revenue", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(revenue), trend: "8.4%", icon: "revenue" },
      { label: "Sitter Applications", value: formatNumber(dashboard.pendingSitterVerifications), trend: "2.1%", direction: "down", icon: "applications" },
    ];
  }, [dashboard]);

  if (error) return <section className={styles.dashboard}><div className={styles.errorState} role="alert"><h1>Dashboard unavailable</h1><p>{error}</p></div></section>;
  if (!dashboard) return <section className={styles.dashboard} aria-busy="true"><div className={styles.loadingState}>Loading dashboard data…</div></section>;

  return <section className={styles.dashboard}><div className={styles.toolbar}><select value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="Dashboard period"><option>Last 30 Days</option><option>Last 90 Days</option><option>This Year</option></select></div><div className={styles.summaryGrid}>{summary.map((card) => <SummaryCard key={card.label} {...card} />)}</div><article className={styles.chartCard}><h2>Revenue Over Time</h2><RevenueChart values={(dashboard.revenue || []).map((payment) => Number(payment.amount || 0))} /></article><article className={styles.servicesCard}><div className={styles.servicesHeading}><h2>Bookings by Service</h2><button type="button" aria-label="More booking options">•••</button></div><ServiceBookings services={dashboard.bookingsByService || []} /></article></section>;
}
