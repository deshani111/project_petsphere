export type BookingStatus = "Upcoming" | "In Progress" | "Completed" | "Cancelled";
export type BookingService = "Boarding" | "Walking" | "Grooming" | "Training";

export interface Booking {
  id: string;
  bookingNumber: string;
  sitter: string;
  initials: string;
  rating: string;
  reviews: string;
  service: BookingService;
  pet: string;
  dates: string;
  date: string;
  startDate: string;
  endDate: string;
  nights: number;
  status: BookingStatus;
  price: string;
  serviceAmount: string;
  platformFee: string;
  taxes: string;
  specialInstructions: string;
  location: string;
}

const sharedDetails = {
  bookingNumber: "#PS-88219",
  sitter: "Sarah Mitchell",
  initials: "SM",
  rating: "4.9",
  reviews: "124",
  service: "Boarding" as const,
  pet: "Buddy",
  startDate: "July 24, 2024",
  endDate: "July 27, 2024",
  nights: 3,
  serviceAmount: "Rs. 4200.00",
  platformFee: "Rs. 150.00",
  taxes: "Rs. 150.00",
  price: "Rs.4500.00",
  specialInstructions: "Please feed twice a day, allergic to chicken. He loves his blue ball for fetch! Buddy gets a bit anxious during thunderstorms, so extra cuddles are appreciated.",
  location: "242 Maplewood St, Colombo 03",
};

export const bookings: Booking[] = [
  { ...sharedDetails, id: "booking-001", service: "Boarding", dates: "Jul 24 - Jul 27, 2024", date: "2024-07-24", status: "Upcoming" },
  { ...sharedDetails, id: "booking-002", bookingNumber: "#PS-88220", sitter: "James Wilson", initials: "JW", rating: "4.8", pet: "Luna", service: "Walking", dates: "Oct 22, 2024", date: "2024-10-22", startDate: "October 22, 2024", endDate: "October 22, 2024", nights: 1, serviceAmount: "Rs. 7500.00", price: "Rs.8000.00", status: "In Progress" },
  { ...sharedDetails, id: "booking-003", bookingNumber: "#PS-88221", sitter: "Emily Chen", initials: "EC", rating: "5.0", pet: "Max", service: "Grooming", dates: "Oct 15, 2024", date: "2024-10-15", startDate: "October 15, 2024", endDate: "October 15, 2024", nights: 1, serviceAmount: "Rs. 16200.00", price: "Rs.16500.00", status: "Completed" },
  { ...sharedDetails, id: "booking-004", bookingNumber: "#PS-88222", dates: "Oct 1 - Oct 5, 2024", date: "2024-10-01", startDate: "October 1, 2024", endDate: "October 5, 2024", nights: 4, price: "Rs.9000.00", status: "Completed" },
  { ...sharedDetails, id: "booking-005", bookingNumber: "#PS-88223", sitter: "Michael Brown", initials: "MB", rating: "4.7", pet: "Bella", service: "Training", dates: "Oct 10, 2024", date: "2024-10-10", startDate: "October 10, 2024", endDate: "October 10, 2024", nights: 1, price: "Rs.18000.00", status: "Cancelled" },
  { ...sharedDetails, id: "booking-006", bookingNumber: "#PS-88224", sitter: "Jessica Lee", initials: "JL", rating: "4.8", pet: "Cooper", service: "Walking", dates: "Nov 2, 2024", date: "2024-11-02", startDate: "November 2, 2024", endDate: "November 2, 2024", nights: 1, price: "Rs.8300.00", status: "Upcoming" },
  { ...sharedDetails, id: "booking-007", bookingNumber: "#PS-88225", dates: "Sep 15 - Sep 20, 2024", date: "2024-09-15", startDate: "September 15, 2024", endDate: "September 20, 2024", nights: 5, price: "Rs.12500.00", status: "Completed" },
  { ...sharedDetails, id: "booking-008", bookingNumber: "#PS-88226", sitter: "David Mitchell", initials: "DM", pet: "Charlie", dates: "Oct 12 - Oct 15, 2024", date: "2024-10-12", startDate: "October 12, 2024", endDate: "October 15, 2024", nights: 3, price: "Rs.27000.00", status: "Upcoming" },
  { ...sharedDetails, id: "booking-009", bookingNumber: "#PS-88227", sitter: "Maya Patel", initials: "MP", pet: "Luna", service: "Grooming", dates: "Oct 8, 2024", date: "2024-10-08", startDate: "October 8, 2024", endDate: "October 8, 2024", nights: 1, price: "Rs.6000.00", status: "Completed" },
  { ...sharedDetails, id: "booking-010", bookingNumber: "#PS-88228", sitter: "Noah Johnson", initials: "NJ", pet: "Misty", service: "Walking", dates: "Sep 17, 2024", date: "2024-09-17", startDate: "September 17, 2024", endDate: "September 17, 2024", nights: 1, price: "Rs.4000.00", status: "Completed" },
  { ...sharedDetails, id: "booking-011", bookingNumber: "#PS-88229", sitter: "Sophia Lee", initials: "SL", pet: "Cooper", service: "Training", dates: "Oct 24, 2024", date: "2024-10-24", startDate: "October 24, 2024", endDate: "October 24, 2024", nights: 1, price: "Rs.11000.00", status: "In Progress" },
  { ...sharedDetails, id: "booking-012", bookingNumber: "#PS-88230", sitter: "Emma Roberts", initials: "ER", pet: "Luna", service: "Walking", dates: "Aug 29, 2024", date: "2024-08-29", startDate: "August 29, 2024", endDate: "August 29, 2024", nights: 1, price: "Rs.4000.00", status: "Completed" },
  { ...sharedDetails, id: "booking-013", bookingNumber: "#PS-88231", sitter: "Oliver Grant", initials: "OG", pet: "Bella", dates: "Oct 28, 2024", date: "2024-10-28", startDate: "October 28, 2024", endDate: "October 28, 2024", nights: 1, price: "Rs.15000.00", status: "Cancelled" },
  { ...sharedDetails, id: "booking-014", bookingNumber: "#PS-88232", sitter: "Ava Williams", initials: "AW", pet: "Max", service: "Grooming", dates: "Nov 5, 2024", date: "2024-11-05", startDate: "November 5, 2024", endDate: "November 5, 2024", nights: 1, price: "Rs.7500.00", status: "Upcoming" },
];

export function getBooking(id: string) {
  return bookings.find((booking) => booking.id === id) ?? bookings[0];
}
