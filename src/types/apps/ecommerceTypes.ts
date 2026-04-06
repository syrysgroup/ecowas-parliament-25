export type Customer = {
  customerId: number;
  customer: string;
  email: string;
  country: string;
  countryFlag: string;
  order: number;
  totalSpent: number;
  avatar?: string;
  status: "active" | "inactive" | "pending";
};
