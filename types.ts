export enum Role {
  Employee = 'EMPLOYEE',
  Vendor = 'VENDOR',
  Admin = 'ADMIN',
}

export enum MealCategory {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
}

export enum OrderStatus {
  Pending = 'Pending',
  Preparing = 'Preparing',
  Ready = 'Ready',
  PickedUp = 'Picked Up',
}

export enum PaymentMethod {
    Card = 'Card',
    UPI = 'UPI',
    COD = 'Cash on Delivery',
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role.Employee;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  role: Role.Vendor;
  averageRating: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: Role.Admin;
}

export type AppUser = User | Vendor | Admin;

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  category: MealCategory;
  price: number;
  imageUrl: string;
  description?: string;
}

export type PaymentStatus = 'Paid' | 'Unpaid';

export interface Order {
  id:string;
  userId: string;
  vendorId: string;
  itemId: string;
  orderDate: string; // Changed to string to match JSON format from an API
  pickupSlot: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  rating?: number | null;
  review?: string | null;
}