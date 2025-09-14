import React, { useState, createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { AppUser, Role, Order, OrderStatus, MenuItem, User, Vendor, Admin, PaymentMethod } from './types';
import { MOCK_USERS, MOCK_VENDOR, MOCK_ADMIN } from './data';
import * as api from './services/api';
import EmployeeView from './components/EmployeeView';
import VendorView from './components/VendorView';
import AdminView from './components/AdminView';
import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import Chatbot from './components/Chatbot';
import { BoxIcon, UserIcon, LogoutIcon, CheckCircleIcon, XMarkIcon, ClockIcon, BuildingOfficeIcon, CalendarDaysIcon, ShieldCheckIcon, CashIcon, SpinnerIcon, StarIcon, PrinterIcon, SunIcon, MoonIcon } from './components/common/Icons';

// Notification Component
const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  const [show, setShow] = useState(false);

  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300); // Animation duration
  }, [onClose]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [handleClose]);

  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
  };

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
      <div
        className={`rounded-xl shadow-2xl relative ${colors[type]} transition-all duration-300 ease-out transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        role="alert"
      >
        <div className="flex items-center p-4">
          <CheckCircleIcon className="w-6 h-6 mr-3" />
          <p className="font-semibold">{message}</p>
          <button onClick={handleClose} className="ml-auto p-1.5 rounded-full hover:bg-white/20 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Shared OrderStatusBadge
export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
    const getStatusColor = () => {
        switch (status) {
            case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300';
            case OrderStatus.Preparing: return 'bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300';
            case OrderStatus.Ready: return 'bg-green-100 text-green-800 dark:bg-green-400/20 dark:text-green-300';
            case OrderStatus.PickedUp: return 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <span className={`px-3 py-1 text-sm font-bold rounded-full whitespace-nowrap ${getStatusColor()}`}>
            {status}
        </span>
    );
};

// Shared StarRatingDisplay
export const StarRatingDisplay = ({ rating, size = 'w-5 h-5' }: { rating: number; size?: string }) => (
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => (
      <StarIcon key={i} className={`${size} ${i < rating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
    ))}
  </div>
);

// Invoice Modal Component
const InvoiceModal = ({ order, user, item, vendor, onClose }: { order: Order; user?: User; item?: MenuItem; vendor?: Vendor; onClose: () => void; }) => {
  if (!user || !item || !vendor) return null;

  const subtotal = item.price;
  const gstRate = 0.05; // 5% GST
  const gstAmount = subtotal * gstRate;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl relative" onClick={e => e.stopPropagation()}>
        <div className="printable-area p-8" id={`invoice-${order.id}`}>
          <header className="flex justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-3">
                <BoxIcon className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">QuickMeal</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Corporate Food Solutions</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 uppercase">Tax Invoice</h2>
              <p className="font-mono text-sm text-slate-500 dark:text-slate-400 mt-1"># {order.id}</p>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-sm">
            <div>
              <h3 className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
              <p className="text-slate-600 dark:text-slate-300">{user.department}</p>
              <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">From</h3>
              <p className="font-bold text-slate-800 dark:text-slate-100">{vendor.name}</p>
              <p className="text-slate-600 dark:text-slate-300">Corp. Office, Tech Park, India</p>
              <p className="text-slate-600 dark:text-slate-300">{vendor.email}</p>
            </div>
            <div className="md:text-right">
              <h3 className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Invoice Date</h3>
              <p className="font-bold text-slate-800 dark:text-slate-100">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
          </section>
          
          <section className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase">Item</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase text-center">Qty</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Price</th>
                  <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{item.name}</td>
                  <td className="p-3 text-center text-slate-600 dark:text-slate-300">1</td>
                  <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-300">₹{subtotal.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-medium text-slate-800 dark:text-slate-100">₹{subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="flex justify-end mt-6">
            <div className="w-full max-w-xs text-sm">
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-300">Subtotal</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-100">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-300">GST (5%)</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-100">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-300 dark:border-slate-600 mt-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 text-base">Grand Total</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-base">₹{Math.round(grandTotal)}</span>
              </div>
            </div>
          </section>

          <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p>Payment Status: <strong className={order.paymentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>{order.paymentStatus}</strong> via {order.paymentMethod}</p>
            <p className="mt-1">Thank you for your business!</p>
          </footer>
        </div>
         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-3 no-print">
          <button onClick={onClose} className="px-5 py-2.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Close</button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            <PrinterIcon className="w-5 h-5"/>
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// App Context
interface AppContextType {
  currentUser: AppUser | null;
  orders: Order[];
  menuItems: MenuItem[];
  login: (role: Role) => void;
  logout: () => void;
  placeOrder: (newOrderData: { itemId: string; pickupSlot: string; paymentMethod: PaymentMethod }) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addMenuItem: (newItemData: Omit<MenuItem, 'id' | 'vendorId'>) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  submitReview: (orderId: string, rating: number, review: string) => Promise<void>;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  setViewInvoice: (order: Order | null) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

// Header Component
const Header = () => {
  const { currentUser, logout, theme, toggleTheme } = useAppContext();
  const roleName = currentUser?.role.charAt(0) + currentUser?.role.slice(1).toLowerCase();
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700/50 no-print">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BoxIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">QuickMeal</h1>
        </div>
        {currentUser && (
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-slate-700 dark:text-slate-200">{currentUser.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{roleName}</p>
            </div>
            <button onClick={logout} className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-full transition-colors">
              <LogoutIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// App Provider
const AppProvider = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [viewingInvoiceForOrder, setViewingInvoiceForOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  }, []);

  const fetchData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
        const [menuData, ordersData] = await Promise.all([
            api.getMenuItems(),
            api.getOrders(),
        ]);
        setMenuItems(menuData);
        setOrders(ordersData);
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
        showNotification("Could not load app data. Please try again later.", "error");
    } finally {
        setIsInitialLoading(false);
    }
  }, [showNotification]);

  const login = useCallback((role: Role) => {
    let user: AppUser | null = null;
    switch (role) {
      case Role.Employee:
        user = MOCK_USERS[0];
        break;
      case Role.Vendor:
        user = MOCK_VENDOR;
        break;
      case Role.Admin:
        user = MOCK_ADMIN;
        break;
    }

    if (user) {
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      fetchData();
    }
  }, [fetchData]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setOrders([]);
    setMenuItems([]);
  }, []);

  const placeOrder = useCallback(async (newOrderData: { itemId: string; pickupSlot: string, paymentMethod: PaymentMethod }) => {
    if (currentUser && currentUser.role === Role.Employee) {
      setIsLoading(true);
      try {
        const newOrder = await api.createOrder({
          ...newOrderData,
          userId: currentUser.id,
          vendorId: 'vendor-01',
          status: OrderStatus.Pending,
          paymentStatus: newOrderData.paymentMethod === PaymentMethod.COD ? 'Unpaid' : 'Paid',
        });
        setOrders(prev => [newOrder, ...prev]);
      } catch (error) {
        showNotification('Failed to place order.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser, showNotification]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setIsLoading(true);
    try {
        const updatedOrder = await api.updateOrder(orderId, { status });
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch (error) {
        showNotification('Failed to update order status.', 'error');
    } finally {
        setIsLoading(false);
    }
  }, [showNotification]);

  const addMenuItem = useCallback(async (newItemData: Omit<MenuItem, 'id' | 'vendorId'>) => {
    if(currentUser && currentUser.role === Role.Vendor) {
      setIsLoading(true);
      try {
        const newItem = await api.createMenuItem({ ...newItemData, vendorId: currentUser.id });
        setMenuItems(prev => [newItem, ...prev]);
      } catch (error) {
        showNotification('Failed to add menu item.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentUser, showNotification]);

  const deleteMenuItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
        await api.deleteMenuItem(itemId);
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
        showNotification('Failed to delete menu item.', 'error');
    } finally {
        setIsLoading(false);
    }
  }, [showNotification]);

  const submitReview = useCallback(async (orderId: string, rating: number, review: string) => {
    setIsLoading(true);
    try {
      const updatedOrder = await api.submitReview(orderId, rating, review);
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    } catch(error) {
      showNotification('Failed to submit review.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const value = {
    currentUser, orders, menuItems, login, logout, placeOrder, updateOrderStatus,
    addMenuItem, deleteMenuItem, submitReview, showNotification, setViewInvoice: setViewingInvoiceForOrder,
    isLoading: isLoading || isInitialLoading,
    theme, toggleTheme
  };

  return (
    <AppContext.Provider value={value}>
        {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        {viewingInvoiceForOrder && (
            <InvoiceModal 
                order={viewingInvoiceForOrder} 
                user={MOCK_USERS.find(u => u.id === viewingInvoiceForOrder.userId)}
                item={menuItems.find(i => i.id === viewingInvoiceForOrder.itemId)}
                vendor={MOCK_VENDOR}
                onClose={() => setViewingInvoiceForOrder(null)}
            />
        )}
        <AppContent 
          isInitialLoading={isInitialLoading} 
          isLoginModalOpen={isLoginModalOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
        />
    </AppContext.Provider>
  );
};


const AppContent = ({ 
  isInitialLoading, 
  isLoginModalOpen, 
  setIsLoginModalOpen,
}: { 
  isInitialLoading: boolean; 
  isLoginModalOpen: boolean; 
  setIsLoginModalOpen: (isOpen: boolean) => void;
}) => {
  const { currentUser, login } = useAppContext();

  if (!currentUser) {
    return (
      <>
        <LandingPage 
          onAuthClick={() => setIsLoginModalOpen(true)}
        />
        {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={login} />}
      </>
    )
  }
  
  if (isInitialLoading) {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
            <SpinnerIcon className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">Loading your dashboard...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Header />
      <main>
        {currentUser.role === Role.Employee && <EmployeeView />}
        {currentUser.role === Role.Vendor && <VendorView />}
        {currentUser.role === Role.Admin && <AdminView />}
      </main>
      <Chatbot />
    </div>
  );
}

const App = () => (
  <AppProvider />
);

export default App;