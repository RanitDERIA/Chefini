'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Package,
    Trash2,
    Calendar,
    Clock,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    BookHeart
} from 'lucide-react';
import Toast, { useToast } from '@/components/ui/Toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface BatchPlan {
    _id: string;
    batch_title: string;
    total_prep_time: string;
    days: number;
    ingredients: string[];
    createdAt: string;
    build_phase: any[];
    runtime_phase: any[];
    storage_tip: string;
}

export default function BatchHistoryPage() {
    const [plans, setPlans] = useState<BatchPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { showToast, toasts, removeToast } = useToast();

    const headerColors = [
        'bg-chefini-yellow',
        'bg-emerald-400',
        'bg-rose-400',
        'bg-cyan-400',
        'bg-violet-400',
        'bg-orange-400'
    ];

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/batch/history');
            const data = await res.json();

            if (data.success) {
                setPlans(data.plans);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        setDeleteId(id);
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/batch/history?id=${deleteId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setPlans(plans.filter(p => p._id !== deleteId));
                showToast('Plan deleted successfully!', 'success');
            }
        } catch (error) {
            showToast('Failed to delete plan', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Package size={64} className="mx-auto mb-4 text-chefini-yellow animate-pulse" />
                <p className="text-xl font-bold">Loading your saved plans...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <ConfirmationModal
                isOpen={!!deleteId}
                title="Delete Plan?"
                message="This will permanently remove this batch plan from your history."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                confirmLabel="Delete Forever"
            />

            {/* Toast Container */}
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
            ))}
            {/* Header */}
            <div className="mb-8 bg-black border-4 border-chefini-yellow p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/batch">
                            <button className="p-2 bg-chefini-yellow text-black hover:bg-white transition-colors border-2 border-black">
                                <ArrowLeft size={24} />
                            </button>
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                            <Package className="text-chefini-yellow flex-shrink-0" size={32} />
                            SAVED BATCH PLANS
                        </h1>
                    </div>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">
                        Your meal prep history • {plans.length} saved plans
                    </p>
                </div>

                {/* Cookbook Shortcut */}
                <Link href="/cookbook">
                    <button className="flex items-center gap-2 px-4 py-3 bg-white text-black font-black border-4 border-black hover:bg-chefini-yellow transition-colors shadow-brutal-sm">
                        <BookHeart size={20} />
                        GO TO MY COOKBOOK
                    </button>
                </Link>
            </div>

            {/* Plans List */}
            {plans.length === 0 ? (
                <div className="border-4 border-chefini-yellow bg-black p-12 text-center">
                    <Package size={64} className="mx-auto mb-4 text-chefini-yellow" />
                    <h2 className="text-2xl font-black mb-2">NO SAVED PLANS YET</h2>
                    <p className="text-gray-400 mb-4">Create your first batch meal plan to see it here!</p>
                    <Link href="/batch">
                        <button className="px-6 py-3 bg-chefini-yellow text-black font-black border-2 border-black hover:bg-white transition-all">
                            CREATE MEAL PLAN
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {plans.map((plan, index) => {
                        const isExpanded = expandedPlan === plan._id;
                        const headerColor = headerColors[index % headerColors.length];

                        return (
                            <div key={plan._id} className="bg-white border-4 border-black shadow-brutal transition-all hover:shadow-brutal-lg hover:-translate-y-1 duration-300">
                                {/* Plan Header */}
                                <div className={`${headerColor} p-3 md:p-5 border-b-4 border-black flex items-center justify-between cursor-pointer hover:brightness-110 transition-all`}
                                    onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="text-lg md:text-2xl font-black text-black uppercase truncate">{plan.batch_title}</h3>
                                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm font-bold text-black mt-2">
                                            <span className="flex items-center gap-1 bg-white px-2 py-1 border-2 border-black whitespace-nowrap">
                                                <Clock size={12} className="md:w-[14px] md:h-[14px]" /> {plan.total_prep_time}
                                            </span>
                                            <span className="flex items-center gap-1 bg-white px-2 py-1 border-2 border-black whitespace-nowrap">
                                                <Calendar size={12} className="md:w-[14px] md:h-[14px]" /> {plan.days} Days
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDelete(plan._id);
                                            }}
                                            className="p-2 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors z-10"
                                            title="Delete Plan"
                                        >
                                            <Trash2 size={16} className="md:w-[20px] md:h-[20px]" />
                                        </button>
                                        <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} className="text-black md:w-[28px] md:h-[28px]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="p-4 md:p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">

                                            {/* LEFT: Ingredients */}
                                            <div>
                                                <h4 className="font-black text-base md:text-lg text-black mb-3 flex items-center gap-2 border-b-2 border-black pb-1 w-fit">
                                                    <span className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-black ${headerColor}`}></span>
                                                    PROPOSED INGREDIENTS
                                                </h4>
                                                <div className="bg-gray-50 border-2 border-black p-3 md:p-4">
                                                    <ul className="space-y-1">
                                                        {plan.ingredients.map((ing, i) => (
                                                            <li key={i} className="text-xs md:text-sm font-bold text-gray-800 flex items-start gap-2">
                                                                <span className="text-chefini-yellow mt-1">▪</span>
                                                                {ing.toLowerCase().replace(/\b\w/g, s => s.toUpperCase())}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* RIGHT: Daily Dishes */}
                                            <div>
                                                <h4 className="font-black text-base md:text-lg text-black mb-3 flex items-center gap-2 border-b-2 border-black pb-1 w-fit">
                                                    <span className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-black ${headerColor}`}></span>
                                                    DISHES TO MAKE
                                                </h4>
                                                <div className="space-y-2 md:space-y-3">
                                                    {plan.runtime_phase.map((meal: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-3 bg-white border-2 border-black p-2 md:p-3 shadow-brutal-sm">
                                                            <div className="bg-black text-chefini-yellow w-7 h-7 md:w-8 md:h-8 flex flex-shrink-0 items-center justify-center font-black text-sm md:text-base border border-black">
                                                                {meal.day}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-black text-sm md:text-base leading-tight text-black truncate">
                                                                    {meal.title || 'Untitled Meal'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 font-bold mt-0.5 flex items-center gap-1">
                                                                    <Clock size={10} className="md:w-[12px] md:h-[12px]" /> {meal.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>

                                        {/* Storage Tip Footer */}
                                        {plan.storage_tip && (
                                            <div className="mt-4 md:mt-6 bg-blue-50 border-l-4 border-blue-500 p-3 md:p-4">
                                                <p className="text-xs md:text-sm font-bold text-blue-900 flex items-start gap-2 break-words">
                                                    <span className="uppercase text-blue-600 font-black flex-shrink-0">Storage Tip:</span>
                                                    {plan.storage_tip}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
