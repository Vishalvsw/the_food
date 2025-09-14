import { User, Vendor, MenuItem, Order, Role, MealCategory, OrderStatus, Admin, PaymentMethod } from './types';

export const MOCK_ADMIN: Admin = {
  id: 'admin-01',
  name: 'Super Admin',
  email: 'admin@corp.com',
  role: Role.Admin,
};

export const MOCK_VENDOR: Vendor = {
  id: 'vendor-01',
  name: 'Healthy Bites Catering',
  email: 'vendor@corp.com',
  role: Role.Vendor,
  averageRating: 4.6,
};

export const MOCK_USERS: User[] = [
  { id: 'user-01', name: 'Alice Johnson', email: 'alice@corp.com', department: 'Engineering', role: Role.Employee },
  { id: 'user-02', name: 'Bob Williams', email: 'bob@corp.com', department: 'Marketing', role: Role.Employee },
  { id: 'user-03', name: 'Charlie Brown', email: 'charlie@corp.com', department: 'Sales', role: Role.Employee },
];

export const MOCK_MENU_ITEMS: MenuItem[] = []; // Will be fetched from backend
export const MOCK_ORDERS: Order[] = []; // Will be fetched from backend


export const PICKUP_SLOTS = {
  [MealCategory.Breakfast]: ["08:00 AM - 08:30 AM", "08:30 AM - 09:00 AM", "09:00 AM - 09:30 AM"],
  [MealCategory.Lunch]: ["12:00 PM - 12:30 PM", "12:30 PM - 01:00 PM", "01:00 PM - 01:30 PM", "01:30 PM - 02:00 PM"],
  [MealCategory.Dinner]: ["05:00 PM - 05:30 PM", "05:30 PM - 06:00 PM", "06:00 PM - 06:30 PM", "08:00 PM - 08:30 PM", "08:30 PM - 09:00 PM"],
};

export const ORDER_LEAD_TIME_MINUTES = 60; // Employees must order at least 60 minutes before the pickup slot starts.