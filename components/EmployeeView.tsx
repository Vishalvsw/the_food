import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { MealCategory, MenuItem, Order, OrderStatus, PaymentMethod } from '../types';
import { PICKUP_SLOTS, ORDER_LEAD_TIME_MINUTES } from '../data';
import { useAppContext } from '../App';
import { ClockIcon, SearchIcon, CreditCardIcon, SpinnerIcon, CheckCircleIcon, PlusIcon, XMarkIcon, ArrowRightIcon, SparklesIcon, TicketIcon } from './common/Icons';
// FIX: Changed to a named import to match the export from MyOrdersView.tsx
import { MyOrdersView } from './MyOrdersView';

type View = 'menu' | 'orders';
type CheckoutStep = 'slot' | 'payment' | 'processing' | 'success';

// Helper to parse slot start time for today's date
const getSlotStartTime = (slot: string): Date => {
  const now = new Date();
  const timePart = slot.split(' ')[0];
  const isPM = slot.includes('PM');
  
  let [hours, minutes] = timePart.split(':').map(Number);

  if (isPM && hours < 12) {
    hours += 12;
  }
  if (!isPM && hours === 12) { // Handle 12 AM
    hours = 0;
  }

  const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  return slotDate;
};

// Helper to check if a single slot is available for ordering
const isSlotAvailable = (slot: string): boolean => {
    const slotTime = getSlotStartTime(slot);
    if (isNaN(slotTime.getTime())) return false; // Invalid date
    const cutoffTime = new Date(slotTime.getTime() - ORDER_LEAD_TIME_MINUTES * 60 * 1000);
    return new Date() < cutoffTime;
};

// CheckoutModal Component
const CheckoutModal = ({ item, onClose, onConfirm }: { item: MenuItem; onClose: () => void; onConfirm: (slot: string, paymentMethod: PaymentMethod) => void; }) => {
  const availableSlots = useMemo(() => PICKUP_SLOTS[item.category].filter(isSlotAvailable), [item.category]);
  
  const [step, setStep] = useState<CheckoutStep>('slot');
  const [selectedSlot, setSelectedSlot] = useState<string>(availableSlots[0] || '');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === 'processing') {
      timer = setTimeout(() => setStep('success'), 2500);
    } else if (step === 'success') {
      timer = setTimeout(() => {
        if(selectedSlot && selectedMethod) onConfirm(selectedSlot, selectedMethod);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [step, onConfirm, selectedSlot, selectedMethod]);
  
  const handleConfirmPayment = () => {
    if (!selectedMethod) return;
    if (selectedMethod === PaymentMethod.COD) {
      onConfirm(selectedSlot, PaymentMethod.COD);
    } else {
      setStep('processing');
    }
  };

  const paymentOptions = [
    { id: PaymentMethod.Card, name: 'Credit/Debit Card', icon: <CreditCardIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" /> },
    { id: PaymentMethod.UPI, name: 'UPI', icon: <img src="https://www.vectorlogo.zone/logos/upi/upi-icon.svg" alt="UPI" className="w-6 h-6"/> },
    { id: PaymentMethod.COD, name: 'Cash on Delivery', icon: <span className="font-bold text-xl text-slate-600 dark:text-slate-300">₹</span> },
  ];
    
  const renderContent = () => {
    switch (step) {
      case 'slot':
        return (
          <>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 mb-4 font-semibold">Select a pickup time slot.</p>
              <div className="space-y-3">
                {PICKUP_SLOTS[item.category].map(slot => {
                    const isAvailable = isSlotAvailable(slot);
                    return (
                        <label key={slot} className={`flex items-center p-4 rounded-lg border transition-all ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'} ${selectedSlot === slot && isAvailable ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-500' : isAvailable ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                            <input type="radio" name="pickupSlot" value={slot} checked={selectedSlot === slot} onChange={() => setSelectedSlot(slot)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:bg-slate-700" disabled={!isAvailable} />
                            <span className="ml-4 text-base font-medium">{slot}</span>
                            {!isAvailable && <span className="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">Unavailable</span>}
                        </label>
                    );
                })}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end">
              <button onClick={() => setStep('payment')} disabled={!selectedSlot} className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Next <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        );
      case 'payment':
        return (
          <>
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 mb-4 font-semibold">Select a payment method.</p>
              <div className="space-y-3">
                {paymentOptions.map(opt => (
                  <label key={opt.id} className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${selectedMethod === opt.id ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 ring-2 ring-indigo-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'}`}>
                    <input type="radio" name="paymentMethod" value={opt.id} checked={selectedMethod === opt.id} onChange={() => setSelectedMethod(opt.id)} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:bg-slate-700" />
                    <div className="ml-4 flex items-center gap-4 text-slate-800 dark:text-slate-200 font-medium">
                      <div className="w-6 flex justify-center items-center">{opt.icon}</div>
                      <span>{opt.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-between sm:justify-end gap-3">
                <button onClick={() => setStep('slot')} className="px-5 py-2.5 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-md font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Back</button>
                <button onClick={handleConfirmPayment} disabled={!selectedMethod} className="px-5 py-2.5 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 disabled:cursor-not-allowed">
                  {selectedMethod === PaymentMethod.COD ? 'Confirm Order' : `Pay ₹${item.price}`}
                </button>
            </div>
          </>
        );
      case 'processing':
        return (
          <div className="p-10 flex flex-col items-center justify-center h-80">
            <SpinnerIcon className="w-12 h-12 text-indigo-600 animate-spin" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-6">Processing Payment...</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Please wait, do not close this window.</p>
          </div>
        );
      case 'success':
        return (
          <div className="p-10 flex flex-col items-center justify-center h-80 bg-green-50 dark:bg-green-900/20">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300 mt-5">Payment Successful!</h3>
            <p className="text-green-600 dark:text-green-400 mt-1">Your order is confirmed.</p>
          </div>
        );
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="p-6 flex justify-between items-start border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.name}</h3>
              <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-1">₹{item.price}</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {renderContent()}
      </div>
    </div>
  );
};

// MenuItemCard Component
const MenuItemCard = ({ item, onOrder, isOrderable, isRecommended = false }: { item: MenuItem; onOrder: (item: MenuItem) => void; isOrderable: boolean; isRecommended?: boolean; }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300 flex flex-col ${isRecommended ? 'ring-2 ring-indigo-500 shadow-indigo-200 dark:shadow-indigo-900/50' : 'dark:border dark:border-slate-700'}`}>
    <div className="relative">
      <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <p className="absolute bottom-3 right-3 bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">₹{item.price}</p>
       {isRecommended && <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><SparklesIcon className="w-4 h-4"/> AI Pick</div>}
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 h-10 overflow-hidden">{item.description}</p>
      <div className="flex-grow"></div>
      <button 
        onClick={() => onOrder(item)} 
        disabled={!isOrderable}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed group-hover:bg-indigo-700"
      >
        <PlusIcon className="w-5 h-5"/>
        {isOrderable ? 'Order Now' : 'Ordering Closed'}
      </button>
    </div>
  </div>
);

const AIRecommendations = ({ menuItems, onOrder, isOrderable }: { menuItems: MenuItem[], onOrder: (item: MenuItem) => void, isOrderable: boolean }) => {
    const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (menuItems.length === 0) return;
            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `You are a food recommendation engine for a corporate office app. From the following menu, please recommend 3 items that are popular and provide a good variety. Menu: ${JSON.stringify(menuItems.map(m => ({id: m.id, name: m.name, category: m.category, description: m.description})))}`,
                    config: {
                      responseMimeType: "application/json",
                      responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                          recommended_ids: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                          }
                        }
                      }
                    }
                });
                
                const result = JSON.parse(response.text);
                const recommendedIds = result.recommended_ids || [];
                const recommendedItems = menuItems.filter(item => recommendedIds.includes(item.id));
                setRecommendations(recommendedItems);

            } catch (error) {
                console.error("Error fetching AI recommendations:", error);
                // Fallback to first 3 items on error
                setRecommendations(menuItems.slice(0, 3));
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [menuItems]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-5 animate-pulse">
                        <div className="bg-slate-200 dark:bg-slate-700 h-48 rounded-lg"></div>
                        <div className="mt-4 bg-slate-200 dark:bg-slate-700 h-6 w-3/4 rounded"></div>
                        <div className="mt-2 bg-slate-200 dark:bg-slate-700 h-4 w-1/2 rounded"></div>
                        <div className="mt-4 bg-slate-200 dark:bg-slate-700 h-12 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (recommendations.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recommendations.map(item => <MenuItemCard key={item.id} item={item} onOrder={onOrder} isOrderable={isOrderable} isRecommended />)}
        </div>
    );
};

const EmployeeView = () => {
  const { currentUser, orders, placeOrder, menuItems: allMenuItems, showNotification } = useAppContext();
  const [activeView, setActiveView] = useState<View>('menu');
  const [activeCategory, setActiveCategory] = useState<MealCategory>(MealCategory.Lunch);
  const [orderingItem, setOrderingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [luckyCode, setLuckyCode] = useState<string | null>(null);
  
  const isCategoryOrderable = useMemo(() => {
    return PICKUP_SLOTS[activeCategory].some(isSlotAvailable);
  }, [activeCategory]);
  
  const handleStartOrder = useCallback((item: MenuItem) => {
    setOrderingItem(item);
  }, []);

  const handleConfirmOrder = useCallback(async (slot: string, paymentMethod: PaymentMethod) => {
    if (orderingItem && currentUser?.role === 'EMPLOYEE') {
      await placeOrder({
        itemId: orderingItem.id,
        pickupSlot: slot,
        paymentMethod: paymentMethod,
      });
      setOrderingItem(null);
      showNotification('Your order has been placed!');
    }
  }, [orderingItem, currentUser, placeOrder, showNotification]);

  const handleCancelOrder = useCallback(() => {
    setOrderingItem(null);
  }, []);

  const handleLuckyClick = () => {
    const codes = ["SAVE10", "MEALDEAL", "LUCKY20", "FREEBIE"];
    const code = codes[Math.floor(Math.random() * codes.length)];
    setLuckyCode(code);
    showNotification(`Your discount code is ${code}!`);
  };

  const userOrders = orders.filter(o => o.userId === currentUser?.id);

  const menuItems = useMemo(() => allMenuItems
    .filter(item => item.category === activeCategory)
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())), 
    [activeCategory, searchQuery, allMenuItems]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Welcome, {currentUser?.name.split(' ')[0]}!</h2>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">Ready to order your next meal?</p>

      {/* View Tabs */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveView('menu')} className={`py-4 px-1 border-b-2 font-semibold text-base transition-colors ${activeView === 'menu' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'}`}>
            Place Order
          </button>
          <button onClick={() => setActiveView('orders')} className={`py-4 px-1 border-b-2 font-semibold text-base transition-colors relative ${activeView === 'orders' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'}`}>
            My Orders
            {userOrders.length > 0 && 
              <span className="absolute top-3 -right-5 ml-2 min-w-[24px] h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-bold text-xs rounded-full px-2">
                {userOrders.length}
              </span>
            }
          </button>
        </nav>
      </div>

      {activeView === 'menu' && (
        <div className="space-y-12">
          {/* Offers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-2xl">Festival Offer!</h3>
                    <p className="opacity-90 mt-1">Get 25% off on all Dinner items.</p>
                </div>
                <TicketIcon className="w-16 h-16 opacity-30"/>
            </div>
             <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl shadow-inner flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100">Feeling Lucky?</h3>
                    {luckyCode ? 
                      <p className="text-slate-600 dark:text-slate-300 mt-1">Your code: <strong className="text-indigo-600 dark:text-indigo-300 font-mono bg-indigo-100 dark:bg-indigo-500/20 p-1 rounded">{luckyCode}</strong></p> :
                      <p className="text-slate-600 dark:text-slate-300 mt-1">Click the button for a surprise discount!</p>
                    }
                </div>
                <button onClick={handleLuckyClick} disabled={!!luckyCode} className="bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed">
                    Reveal Code
                </button>
            </div>
          </div>
          
          <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              {/* Category Pills */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full overflow-x-auto">
                {Object.values(MealCategory).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all ${activeCategory === cat ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              {/* Search Bar */}
              <div className="relative flex-grow md:flex-grow-0 md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <SearchIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                      type="text"
                      placeholder="Search meals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full block pl-11 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:text-slate-200"
                  />
              </div>
            </div>
            
            {!isCategoryOrderable && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-6 rounded-md" role="alert">
                <p className="font-bold">Ordering Closed</p>
                <p>There are no available pickup slots for {activeCategory} at this time. Please check back later.</p>
              </div>
            )}
            
            {/* AI Recommendations */}
            {menuItems.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-indigo-500" /> Recommended For You</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Handpicked by our AI to delight your taste buds.</p>
                    <AIRecommendations menuItems={menuItems} onOrder={handleStartOrder} isOrderable={isCategoryOrderable} />
                </div>
            )}

            {/* Full Menu */}
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Full {activeCategory} Menu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {menuItems.map(item => <MenuItemCard key={item.id} item={item} onOrder={handleStartOrder} isOrderable={isCategoryOrderable} />)}
              </div>
            </div>

            {menuItems.length === 0 && (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Meals Found</p>
                  <p className="mt-1">Try adjusting your search or selecting a different category.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'orders' && <MyOrdersView orders={userOrders} menuItems={allMenuItems} />}

      {orderingItem && <CheckoutModal item={orderingItem} onClose={handleCancelOrder} onConfirm={handleConfirmOrder} />}
    </div>
  );
};

export default EmployeeView;