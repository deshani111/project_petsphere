export type Service = {
  id: string;
  name: string;
  price: number;
  unit?: string;
};

export const services: Service[] = [
  { id: "boarding", name: "Boarding", price: 1500, unit: "per night" },
  { id: "walking", name: "Dog Walking", price: 300, unit: "per session" },
  { id: "grooming", name: "Grooming", price: 800, unit: "per session" },
];

export const nights = 3;
export const serviceFee = 199;

export function formatRs(value: number) {
  return `₹${value}`;
}
