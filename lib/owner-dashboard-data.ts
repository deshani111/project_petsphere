export type Pet = {
  id: number;
  name: string;
  details: string;
  image: string;
};

export type BookingStatus = "Confirmed" | "Completed";

export type Booking = {
  id: number;
  sitter: string;
  sitterImage: string;
  pet: string;
  service: string;
  date: string;
  status: BookingStatus;
  amount: string;
};

export const dashboardStats = [
  { label: "Active bookings", value: "04", icon: "calendar" as const, tone: "rose" as const },
  { label: "Messages", value: "12", icon: "mail" as const, tone: "mint" as const },
  { label: "Next appointment", value: "July 14, 10:00 AM", icon: "clock" as const, tone: "coral" as const },
];

export const pets: Pet[] = [
  {
    id: 1,
    name: "Cooper",
    details: "Golden Retriever • 1 Years Old",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 2,
    name: "Luna",
    details: "Siamese • 2 Year Old",
    image: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 3,
    name: "Misty",
    details: "Domestic Shorthair • 5 Year Old",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=700&q=85",
  },
];

export const recentBookings: Booking[] = [
  {
    id: 1,
    sitter: "Shannon Perera",
    sitterImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80",
    pet: "Cooper",
    service: "Dog Walking",
    date: "July 14, 2026",
    status: "Confirmed",
    amount: "Rs. 5,000.00",
  },
  {
    id: 2,
    sitter: "Mark Fernando",
    sitterImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80",
    pet: "Luna",
    service: "Pet Sitting",
    date: "May 22, 2026",
    status: "Completed",
    amount: "Rs. 8,000.00",
  },
  {
    id: 3,
    sitter: "Nivya Perera",
    sitterImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80",
    pet: "Misty",
    service: "Grooming",
    date: "May 20, 2026",
    status: "Completed",
    amount: "Rs. 6,000.00",
  },
];
