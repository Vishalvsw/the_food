import React, { useMemo, useState } from 'react';
import { useAppContext, StarRatingDisplay } from '../App';
import { MOCK_USERS } from '../data';
import { ChartBarIcon, ClockIcon, UsersIcon, CreditCardIcon, CashIcon } from './common/Icons';
import { OrderStatus, PaymentMethod } from '../types';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex items-center gap-5">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 p-4 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const AdminView = () => {
    const { orders, menuItems, setViewInvoice } = useAppContext();
    const allUsers = MOCK_USERS; // For this demo, just using mock employees
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const stats = useMemo(() => {
        const totalRevenue = orders
            .filter(o => o.paymentStatus === 'Paid')
            .reduce((acc, order) => {
                const item = menuItems.find(mi => mi.id === order.itemId);
                return acc + (item?.price || 0);
            }, 0);

        return {
            totalUsers: allUsers.length,
            totalOrders: orders.length,
            totalRevenue: totalRevenue.toFixed(0),
        };
    }, [orders, menuItems, allUsers]);

    const filteredOrders = useMemo(() => {
        const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        if (statusFilter === 'pending') {
            return sortedOrders.filter(order => order.status !== OrderStatus.PickedUp);
        }
        if (statusFilter === 'completed') {
            return sortedOrders.filter(order => order.status === OrderStatus.PickedUp);
        }
        return sortedOrders;
    }, [orders, statusFilter]);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Pending: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300';
            case OrderStatus.Preparing: return 'bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300';
            case OrderStatus.Ready: return 'bg-green-100 text-green-800 dark:bg-green-400/20 dark:text-green-300';
            case OrderStatus.PickedUp: return 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">Admin Dashboard</h2>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<UsersIcon className="w-7 h-7" />} />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={<ClockIcon className="w-7 h-7" />} />
                <StatCard title="Total Revenue (Paid)" value={`₹${stats.totalRevenue}`} icon={<ChartBarIcon className="w-7 h-7" />} />
            </div>

            {/* Orders */}
            <div>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 gap-4">
                    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">All Orders</h3>
                    <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1.5 rounded-full">
                         {(['all', 'pending', 'completed'] as const).map(filter => (
                            <button 
                                key={filter}
                                onClick={() => setStatusFilter(filter)} 
                                className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-colors capitalize ${statusFilter === filter ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Employee</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Item</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Price</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Payment</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const user = allUsers.find(u => u.id === order.userId);
                                const item = menuItems.find(i => i.id === order.itemId);
                                return (
                                    <tr key={order.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => setViewInvoice(order)}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-base text-slate-800 dark:text-slate-100">{user?.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{user?.department}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">{item?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">₹{item?.price || '0'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* FIX: Corrected incomplete ternary operator for payment method icon */}
                                                {order.paymentMethod === PaymentMethod.COD ? <CashIcon className="w-5 h-5 text-slate-500" /> : <CreditCardIcon className="w-5 h-5 text-slate-500" />}
                                                <div>
                                                    <div className="font-semibold text-slate-800 dark:text-slate-100">{order.paymentMethod}</div>
                                                    <div className={`text-xs font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{order.paymentStatus}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4"><span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span></td>
                                        <td className="px-6 py-4">
                                            {typeof order.rating === 'number' ? <StarRatingDisplay rating={order.rating} /> : <span className="text-slate-400">N/A</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {filteredOrders.length === 0 && (
                        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                            <p className="font-semibold text-lg text-slate-700 dark:text-slate-200">No orders found</p>
                            <p className="text-sm mt-1">Try a different filter to see more orders.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

// FIX: Added missing default export
export default AdminView;
