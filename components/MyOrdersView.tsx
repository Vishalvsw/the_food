import React, { useState } from 'react';
import { Order, MenuItem, OrderStatus } from '../types';
import { ClockIcon, ArrowRightIcon, StarIcon, XMarkIcon, SpinnerIcon } from './common/Icons';
import { useAppContext, StarRatingDisplay } from '../App';

const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.Pending: return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Confirmation' };
        case OrderStatus.Preparing: return { color: 'bg-blue-100 text-blue-800', label: 'Preparing Your Meal' };
        case OrderStatus.Ready: return { color: 'bg-green-100 text-green-800', label: 'Ready for Pickup' };
        case OrderStatus.PickedUp: return { color: 'bg-slate-200 text-slate-800', label: 'Order Picked Up' };
        default: return { color: 'bg-gray-100 text-gray-800', label: 'Status Unknown' };
    }
};

const StarRatingInput = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => (
    <div className="flex items-center justify-center gap-2">
        {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            return (
                <button
                    key={i}
                    type="button"
                    onClick={() => setRating(ratingValue)}
                    className={`p-2 rounded-full transition-colors duration-200 ${ratingValue <= rating ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-300'}`}
                >
                    <StarIcon className="w-10 h-10" />
                </button>
            );
        })}
    </div>
);


const RateOrderModal = ({ order, item, onClose, onSubmit }: { order: Order; item: MenuItem; onClose: () => void; onSubmit: (rating: number, review: string) => void; }) => {
    const { isLoading } = useAppContext();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    
    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit(rating, review);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10 p-2">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <div className="p-8 text-center">
                     <img src={item.imageUrl} alt={item.name} className="w-28 h-28 object-cover rounded-lg mx-auto shadow-lg"/>
                     <h3 className="text-2xl font-bold text-slate-800 mt-5">Rate Your Order</h3>
                     <p className="text-slate-600 mt-1">How was your <strong className="text-slate-800">{item.name}</strong>?</p>
                </div>
                <div className="px-8 pb-6">
                    <StarRatingInput rating={rating} setRating={setRating} />
                </div>
                 <div className="px-8 pb-8">
                    <textarea 
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Optional: Tell us more about your experience..."
                        rows={3}
                        className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="bg-slate-50 px-6 py-4 rounded-b-xl">
                    <button 
                        onClick={handleSubmit} 
                        disabled={rating === 0 || isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                    >
                         {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export const MyOrdersView = ({ orders, menuItems }: { orders: Order[], menuItems: MenuItem[] }) => {
    const { submitReview, showNotification, setViewInvoice } = useAppContext();
    const [ratingOrder, setRatingOrder] = useState<Order | null>(null);

    const handleOpenRating = (order: Order) => {
        setRatingOrder(order);
    };

    const handleCloseRating = () => {
        setRatingOrder(null);
    };
    
    const handleSubmitRating = async (rating: number, review: string) => {
        if (ratingOrder) {
            await submitReview(ratingOrder.id, rating, review);
            showNotification('Thank you for your feedback!');
            handleCloseRating();
        }
    };
    
    if (orders.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500 bg-slate-100/50 rounded-xl">
                <h3 className="text-xl font-semibold text-slate-700">No Orders Yet</h3>
                <p className="mt-2">When you place an order, it will appear here.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map(order => {
                    const item = menuItems.find(mi => mi.id === order.itemId);
                    if (!item) return null;

                    const statusInfo = getStatusInfo(order.status);
                    const canRate = order.status === OrderStatus.PickedUp && typeof order.rating !== 'number';

                    return (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-shadow hover:shadow-xl"
                        >
                            <img src={item.imageUrl} alt={item.name} className="w-full sm:w-28 h-28 object-cover rounded-lg" />
                            <div className="flex-grow">
                                <div className="flex items-center gap-4">
                                    <div className={`px-3 py-1 text-xs font-bold rounded-full inline-block ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </div>
                                    {typeof order.rating === 'number' && <StarRatingDisplay rating={order.rating} />}
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mt-2">{item.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{order.pickupSlot}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 self-stretch">
                                <div className="flex-grow"></div>
                                {canRate ? (
                                    <button onClick={() => handleOpenRating(order)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors">
                                        <StarIcon className="w-5 h-5"/> Rate Order
                                    </button>
                                ) : (
                                     <button disabled className="w-full sm:w-auto px-4 py-2 bg-slate-200 text-slate-500 rounded-lg font-semibold cursor-not-allowed">
                                        {order.rating ? 'Rated' : 'Rate Later'}
                                    </button>
                                )}
                                <button
                                  onClick={() => setViewInvoice(order)}
                                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-indigo-600 font-semibold"
                                >
                                    View Invoice <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {ratingOrder && menuItems.find(mi => mi.id === ratingOrder.itemId) && (
                <RateOrderModal 
                    order={ratingOrder} 
                    item={menuItems.find(mi => mi.id === ratingOrder.itemId)!}
                    onClose={handleCloseRating} 
                    onSubmit={handleSubmitRating}
                />
            )}
        </>
    );
};
