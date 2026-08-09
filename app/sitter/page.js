"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  EllipsisVertical,
  Filter,
  MessageSquare,
  PawPrint,
  Star,
  UserRound,
  WalletCards
} from "lucide-react";
import styles from "./page.module.css";

const pending = [
  {
    pet: "Bruno",
    breed: "Boxer",
    owner: "Mark Davis",
    service: "Dog Walking",
    dates: "Oct 24 - Oct 26",
    emoji: "🐶"
  },
  {
    pet: "Luna",
    breed: "Samoyed",
    owner: "Elena Rodriguez",
    service: "Pet Sitting",
    dates: "Oct 28 - Oct 30",
    emoji: "🐕"
  }
];

const confirmed = [
  {
    pet: "Buddy",
    owner: "Alice Thompson",
    service: "Dog Walking",
    date: "Oct 25, 2023",
    time: "09:00 AM",
    emoji: "🐶"
  },
  {
    pet: "Shadow",
    owner: "James Wilson",
    service: "Pet Boarding",
    date: "Oct 26, 2023",
    time: "Check-in 2:00 PM",
    emoji: "🐈"
  },
  {
    pet: "Mittens",
    owner: "Sophie Lee",
    service: "Pet Sitting",
    date: "Oct 27, 2023",
    time: "06:30 PM",
    emoji: "🐱"
  }
];

export default function SitterDashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome back Sarah !</h1>

        <div className={styles.verified}>
          <span>✓</span>
          Verified Professional
        </div>

        <section className={styles.stats}>
          <Stat icon={<WalletCards size={15} />} label="This Month's Earnings">
            <div className={styles.earning}>
              <strong>LKR<br />1,240.00</strong>
              <em>↗ +12%</em>
            </div>
          </Stat>

          <Stat icon={<CalendarDays size={15} />} label="Upcoming Bookings">
            <strong>8 Confirmed</strong>
            <p>Next: Bruno (Dog Walking)</p>
          </Stat>

          <Stat icon={<Star size={15} />} label="Average Rating">
            <strong>4.9 Stars</strong>
            <p>From 128 verified reviews</p>
          </Stat>

          <Stat icon={<ClipboardList size={15} />} label="Active Services">
            <strong>3 Listed</strong>
            <p>Walking, Boarding, Sitting</p>
          </Stat>
        </section>

        <section className={styles.middle}>
          <div className={styles.pendingBlock}>
            <div className={styles.sectionHead}>
              <h2>
                Pending Requests <b>2</b>
              </h2>
              <Link href="/sitter/bookings">View All</Link>
            </div>

            <div className={styles.pendingGrid}>
              {pending.map((item) => (
                <div className={styles.pendingCard} key={item.pet}>
                  <div className={styles.petTop}>
                    <div className={styles.petImage}>{item.emoji}</div>
                    <div className={styles.petInfo}>
                      <div className={styles.petName}>
                        <strong>{item.pet}</strong>
                        <span>({item.breed})</span>
                        <small>PENDING</small>
                      </div>
                      <p>Owner: {item.owner}</p>
                    </div>
                  </div>

                  <div className={styles.requestInfo}>
                    <div><PawPrint size={12} /> {item.service}</div>
                    <div><CalendarDays size={12} /> {item.dates}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.quick}>
            <h2>Quick Actions</h2>

            <Quick
              href="/sitter/messages"
              icon={<MessageSquare size={15} />}
              title="Messages"
              text="3 unread chats"
            />

            <Quick
              href="/sitter/services"
              icon={<PawPrint size={15} />}
              title="Manage Services"
              text="Update your offerings"
            />

            <Quick
              href="/sitter/profile"
              icon={<UserRound size={15} />}
              title="My Profile"
              text="Keep your info current"
            />
          </div>
        </section>

        <section className={styles.bookings}>
          <div className={styles.sectionHead}>
            <h2>Upcoming Confirmed Bookings</h2>
            <button className={styles.filter} aria-label="Filter">
              <Filter size={13} />
            </button>
          </div>

          <div className={styles.table}>
            <div className={`${styles.row} ${styles.tableHead}`}>
              <span>Pet &amp; Owner</span>
              <span>Service</span>
              <span>Date</span>
              <span>Time</span>
              <span>Status</span>
              <span />
            </div>

            {confirmed.map((item) => (
              <div className={styles.row} key={item.pet}>
                <div className={styles.ownerPet}>
                  <div className={styles.tablePet}>{item.emoji}</div>
                  <div>
                    <strong>{item.pet}</strong>
                    <small>Owner: {item.owner}</small>
                  </div>
                </div>

                <span>{item.service}</span>
                <span>{item.date}</span>
                <span>{item.time}</span>
                <span className={styles.confirmed}>
                  <i /> Confirmed
                </span>
                <button className={styles.more} aria-label="More actions">
                  <EllipsisVertical size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, children }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statHead}>
        <span>{label}</span>
        {icon}
      </div>
      <div className={styles.statBody}>{children}</div>
    </div>
  );
}

function Quick({ href, icon, title, text }) {
  return (
    <Link href={href} className={styles.quickCard}>
      <span className={styles.quickIcon}>{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </Link>
  );
}
