import { Order, MenuItem, OrderStatus, PaymentMethod, MealCategory, PaymentStatus } from '../types';

// This is a MOCK API layer. In a real application, this would use `fetch`
// to make network requests to your NestJS backend.
// For demonstration, we'll simulate the async nature and data shapes.

// --- SIMULATED DATABASE ---
let mockMenuItems: MenuItem[] = [
  // Breakfast
  { id: 'item-01', vendorId: 'vendor-01', name: 'Masala Dosa', category: MealCategory.Breakfast, price: 120, imageUrl: 'https://picsum.photos/id/42/400/300', description: 'A crispy, savory crepe made from fermented rice and lentil batter, filled with a spiced potato mixture.' },
  { id: 'item-02', vendorId: 'vendor-01', name: 'Idli Sambar', category: MealCategory.Breakfast, price: 80, imageUrl: 'https://picsum.photos/id/48/400/300', description: 'Soft, fluffy steamed rice cakes served with a flavorful and aromatic lentil-based vegetable stew.' },
  { id: 'item-03', vendorId: 'vendor-01', name: 'Aloo Paratha with Curd', category: MealCategory.Breakfast, price: 150, imageUrl: 'https://picsum.photos/id/102/400/300', description: 'Whole wheat flatbread stuffed with a delicious spiced potato filling, served with cool, refreshing yogurt.' },
  // Lunch
  { id: 'item-04', vendorId: 'vendor-01', name: 'Butter Chicken with Naan', category: MealCategory.Lunch, price: 350, imageUrl: 'https://picsum.photos/id/211/400/300', description: 'Tender chicken pieces in a rich, creamy tomato sauce, served with soft and chewy naan bread.' },
  { id: 'item-05', vendorId: 'vendor-01', name: 'Paneer Tikka Masala', category: MealCategory.Lunch, price: 280, imageUrl: 'https://picsum.photos/id/405/400/300', description: 'Marinated and grilled cottage cheese cubes in a spicy, creamy onion-tomato gravy.' },
  { id: 'item-06', vendorId: 'vendor-01', name: 'Vegetable Biryani', category: MealCategory.Lunch, price: 220, imageUrl: 'https://picsum.photos/id/658/400/300', description: 'A fragrant and flavorful rice dish cooked with mixed vegetables, herbs, and aromatic spices.' },
  // Dinner
  { id: 'item-07', vendorId: 'vendor-01', name: 'Chicken Korma', category: MealCategory.Dinner, price: 380, imageUrl: 'https://picsum.photos/id/988/400/300', description: 'A mild and creamy chicken curry made with a yogurt and nut-based sauce, delicately spiced.' },
  { id: 'item-08', vendorId: 'vendor-01', name: 'Dal Makhani', category: MealCategory.Dinner, price: 190, imageUrl: 'https://picsum.photos/id/937/400/300', description: 'A rich and creamy dish of black lentils and kidney beans slow-cooked with butter and spices.' },
  { id: 'item-09', vendorId: 'vendor-01', name: 'Palak Paneer', category: MealCategory.Dinner, price: 240, imageUrl: 'https://picsum.photos/id/776/400/300', description: 'Soft cottage cheese cubes cooked in a smooth, creamy spinach gravy with a hint of garlic.' },
];

let mockOrders: Order[] = [
  { id: `order-${Date.now() - 200000}`, userId: 'user-02', vendorId: 'vendor-01', itemId: 'item-04', orderDate: new Date(Date.now() - 200000).toISOString(), pickupSlot: '12:30 PM - 01:00 PM', status: OrderStatus.Ready, paymentMethod: PaymentMethod.Card, paymentStatus: 'Paid' },
  { id: `order-${Date.now() - 100000}`, userId: 'user-03', vendorId: 'vendor-01', itemId: 'item-05', orderDate: new Date(Date.now() - 100000).toISOString(), pickupSlot: '01:00 PM - 01:30 PM', status: OrderStatus.Preparing, paymentMethod: PaymentMethod.UPI, paymentStatus: 'Paid' },
  { id: `order-${Date.now() - 50000}`, userId: 'user-01', vendorId: 'vendor-01', itemId: 'item-01', orderDate: new Date(Date.now() - 50000).toISOString(), pickupSlot: '09:00 AM - 09:30 AM', status: OrderStatus.Pending, paymentMethod: PaymentMethod.COD, paymentStatus: 'Unpaid' },
  { id: `order-prev-1`, userId: 'user-01', vendorId: 'vendor-01', itemId: 'item-06', orderDate: new Date(Date.now() - 86400000).toISOString(), pickupSlot: '01:00 PM - 01:30 PM', status: OrderStatus.PickedUp, paymentMethod: PaymentMethod.COD, paymentStatus: 'Paid', rating: 5, review: "The biryani was fantastic! Perfectly cooked and very flavorful. Will definitely order again." },
  { id: `order-prev-2`, userId: 'user-02', vendorId: 'vendor-01', itemId: 'item-07', orderDate: new Date(Date.now() - 172800000).toISOString(), pickupSlot: '05:30 PM - 06:00 PM', status: OrderStatus.PickedUp, paymentMethod: PaymentMethod.Card, paymentStatus: 'Paid', rating: 4, review: "Chicken korma was creamy and delicious, but I wish it was a little spicier." },
  { id: `order-prev-3`, userId: 'user-03', vendorId: 'vendor-01', itemId: 'item-08', orderDate: new Date(Date.now() - 259200000).toISOString(), pickupSlot: '05:00 PM - 05:30 PM', status: OrderStatus.PickedUp, paymentMethod: PaymentMethod.Card, paymentStatus: 'Paid', rating: 3, review: "It was okay. A bit bland for my taste." },
];

// --- API FUNCTIONS ---
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getMenuItems = async (): Promise<MenuItem[]> => {
  await simulateDelay(500);
  return [...mockMenuItems];
};

export const getOrders = async (): Promise<Order[]> => {
  await simulateDelay(500);
  return [...mockOrders];
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate'>): Promise<Order> => {
  await simulateDelay(1000);
  const newOrder: Order = {
    ...orderData,
    id: `order-${Date.now()}`,
    orderDate: new Date().toISOString(),
  };
  mockOrders.unshift(newOrder);
  return newOrder;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    await simulateDelay(300);
    let orderToUpdate = mockOrders.find(o => o.id === orderId);
    if (!orderToUpdate) {
        throw new Error("Order not found");
    }
    orderToUpdate = { ...orderToUpdate, ...updates };
    mockOrders = mockOrders.map(o => o.id === orderId ? orderToUpdate : o);
    return orderToUpdate;
}

export const createMenuItem = async (itemData: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    await simulateDelay(700);
    const newItem: MenuItem = {
        ...itemData,
        id: `item-${Date.now()}`,
    };
    mockMenuItems.unshift(newItem);
    return newItem;
};

export const deleteMenuItem = async (itemId: string): Promise<void> => {
    await simulateDelay(500);
    mockMenuItems = mockMenuItems.filter(item => item.id !== itemId);
};

export const submitReview = async (orderId: string, rating: number, review: string): Promise<Order> => {
    return updateOrder(orderId, { rating, review });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    console.log(`Requesting password reset for ${email}`);
    await simulateDelay(1500);
    return;
};