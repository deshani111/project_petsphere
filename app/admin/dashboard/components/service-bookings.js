const tones = ["walk", "sit", "groom", "board"];
export default function ServiceBookings({ services }) {
  const fallback = [{ name: "Dog Walking", bookings: 45 }, { name: "Pet Sitting", bookings: 30 }, { name: "Grooming", bookings: 15 }, { name: "Boarding", bookings: 10 }];
  const entries = services.length ? services : fallback;
  const total = entries.reduce((sum, entry) => sum + entry.bookings, 0) || 1;
  return <>{entries.slice(0, 4).map((service, index) => { const percentage = Math.round((service.bookings / total) * 100); return <div className="service-row" key={service.name}><div><span>{service.name}</span><strong>{percentage}%</strong></div><div className="track"><span className={`bar-${tones[index] || "walk"}`} style={{ width: `${percentage}%` }} /></div></div>; })}</>;
}
