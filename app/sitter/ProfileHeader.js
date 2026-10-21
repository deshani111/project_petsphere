"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

const DEFAULT_PROFILE_IMAGE = "/register-pet-care.jpg";

export default function ProfileHeader() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/sitter/profile", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = await response.json();
        return body.profile || body.data || null;
      })
      .then((result) => {
        if (result) setProfile(result);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setProfile(null);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <Link href="/sitter/Profile" className={styles.user} aria-label="Open my profile">
      <img
        src={profile?.profileImage || DEFAULT_PROFILE_IMAGE}
        alt=""
        className={styles.headerAvatar}
      />
      <span>{profile?.fullName || "Sarah Jenkins"}</span>
    </Link>
  );
}
