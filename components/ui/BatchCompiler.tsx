'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    Sparkles,
    Terminal,
    Calendar,
    Clock,
    Flame,
    Package,
    ChevronDown,
    ChevronUp,
    Info,
    Cpu,
    Play,
    Box,
    Utensils,
    Timer,
    Thermometer,
    Zap,
    X,
    Plus,
    Leaf,
    Wheat,
    Drumstick,
    Printer,
    Download,
    FileText,
    Image as ImageIcon,
    BookHeart,
} from 'lucide-react';

// Helper to load external scripts dynamically
const loadScript = (src: string) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });
};

// ==========================================
// TOAST SYSTEM
// ==========================================
interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

function useToast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}

function Toast({ message, type = 'success', onClose, duration = 3000 }: { message: string, type?: 'success' | 'error' | 'info', onClose: () => void, duration?: number }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: 'bg-green-400 border-green-600',
        error: 'bg-red-500 border-red-700',
        info: 'bg-chefini-yellow border-yellow-600'
    };

    const icons = {
        success: CheckCircle2,
        error: AlertTriangle,
        info: Info
    };

    const Icon = icons[type];

    return (
        <div className={`fixed top-6 right-6 z-50 ${styles[type]} border-4 border-black shadow-brutal-lg p-4 min-w-[300px] max-w-md animate-slide-in`}>
            <div className="flex items-start gap-3">
                <Icon className="text-black flex-shrink-0" size={24} />
                <p className="text-black font-bold flex-1">{message}</p>
                <button onClick={onClose} className="text-black hover:opacity-70 transition-opacity">
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}

// ==========================================
// TAG INPUT (for ingredients)
// ==========================================
function TagInput({ tags, onChange, disabled, onValidate, onError }: {
    tags: string[],
    onChange: (tags: string[]) => void,
    disabled?: boolean,
    onValidate?: (text: string) => Promise<{ valid: boolean, reason?: string }>,
    onError?: (msg: string) => void
}) {
    const [input, setInput] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    const addTag = async () => {
        const trimmed = input.trim();
        if (trimmed && !tags.includes(trimmed)) {
            // Optimistic UI? No, wait for validation as requested "checked by ai"
            // But we need to disable input while checking? 
            // The user wanted "whatever ingredients or text as input is first checked"

            // We need a way to pass showToast to TagInput or handle it via props
            // For now, let's assume valid and add, but we need the validation logic.
            // Converting TagInput to async is tricky without loading state.

            // Let's rely on the parent or pass a validator prop. 
            // Actually, TagInput is defined in this file. I can modify it directly.

            if (onValidate) {
                setIsValidating(true);
                const { valid, reason } = await onValidate(trimmed);
                setIsValidating(false);

                if (!valid) {
                    // We need a way to show toast here. 
                    // TagInput currently doesn't have access to showToast.
                    // I'll emit a specific error event or pass showToast?
                    // Easiest is to pass showToast as a prop or onError callback.
                    onError?.(reason || 'Invalid input');
                    return;
                }
            }

            onChange([...tags, trimmed]);
            setInput('');
        }
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    placeholder="e.g., 2kg Chicken Thighs"
                    disabled={disabled}
                    className="w-full sm:flex-1 px-4 py-3 border-2 border-white bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-chefini-yellow font-bold placeholder:text-gray-400 disabled:opacity-50"
                />
                <button
                    onClick={addTag}
                    disabled={disabled || !input.trim() || isValidating}
                    className="w-full sm:w-auto px-6 py-3 bg-chefini-yellow text-black font-black border-2 border-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isValidating ? <span className="animate-spin">⏳</span> : 'ADD'}
                </button>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <div key={i} className="bg-white text-black px-3 py-2 border-2 border-black font-bold flex items-center gap-2 shadow-brutal-sm">
                            <span>{tag}</span>
                            {!disabled && (
                                <button onClick={() => removeTag(i)} className="hover:text-red-600 transition-colors">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================
interface BuildStep {
    task: string;
    duration: string;
    temp: string;
    why: string;
}

interface RuntimeRecipe {
    day: number;
    title: string;
    time: string;
    instructions: string[];
    macros: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
}

interface BatchCompilerOutput {
    batch_title: string;
    total_prep_time: string;
    build_phase: BuildStep[];
    runtime_phase: RuntimeRecipe[];
    storage_tip: string;
}

// Helper: Validation API
const validateContent = async (text: string): Promise<{ valid: boolean; reason?: string }> => {
    try {
        const res = await fetch('/api/validate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        return await res.json();
    } catch (e) {
        return { valid: true }; // Fail open on network error
    }
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function BatchCompiler() {
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [days, setDays] = useState(3);
    const [cookingLevel, setCookingLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [dietary, setDietary] = useState<string[]>([]);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const dietaryOptions = [
        { id: 'vegan', label: 'Vegan', icon: Leaf },
        { id: 'keto', label: 'Keto', icon: Drumstick },
        { id: 'gluten-free', label: 'Gluten-Free', icon: Wheat }
    ];

    const [status, setStatus] = useState<'idle' | 'compiling' | 'compiled'>('idle');
    const [result, setResult] = useState<BatchCompilerOutput | null>(null);
    const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [exportLoading, setExportLoading] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);
    const { showToast, toasts, removeToast } = useToast();

    const toggleStep = (stepIndex: number) => {
        setCompletedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stepIndex)) {
                newSet.delete(stepIndex);
            } else {
                newSet.add(stepIndex);
            }
            return newSet;
        });
    };

    const handleCompile = async () => {
        if (ingredients.length === 0) {
            showToast('Please add at least one ingredient', 'error');
            return;
        }

        setStatus('compiling');
        setResult(null);

        try {
            const res = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingredients,
                    days,
                    cookingLevel,
                    dietary,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data.batch);
                setStatus('compiled');

                if (data.saved && data.batchId) {
                    showToast('✓ Batch plan created and saved!', 'success');
                } else if (data.warning) {
                    showToast('Plan created but not saved. Check your connection.', 'info');
                } else {
                    showToast('Meal plan created successfully!', 'success');
                }

                setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            } else {
                showToast(data.error || 'Plan creation failed', 'error');
                setStatus('idle');
            }
        } catch (err) {
            showToast('Connection failed. Please try again.', 'error');
            setStatus('idle');
        }
    };

    // Helper for HTML escaping
    function escapeHtml(input: string) {
        return String(input)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    // Helper to load external scripts dynamically
    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (error) => reject(error);
            document.head.appendChild(script);
        });
    };

    // ------------------------------------
    // 📄 DOWNLOAD PDF
    // ------------------------------------
    const downloadPDF = async () => {
        if (!result) return;

        const groceryItems = ingredients;
        setExportLoading(true);

        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

            // @ts-ignore
            const { jsPDF } = window.jspdf;
            // @ts-ignore
            const html2canvas = window.html2canvas;

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            tempDiv.style.width = '800px';
            tempDiv.style.background = 'white';
            tempDiv.style.padding = '0';
            tempDiv.style.boxSizing = 'border-box';

            tempDiv.innerHTML = getGroceryListHTML(groceryItems, result.batch_title);

            document.body.appendChild(tempDiv);
            await new Promise(r => setTimeout(r, 200));

            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#fff',
                scale: 2,
                logging: false,
                useCORS: true,
                width: 800
            });

            document.body.removeChild(tempDiv);

            const imgData = canvas.toDataURL('image/png');
            const imgWidthPx = canvas.width;
            const imgHeightPx = canvas.height;
            const pdfWidth = 210;
            const pdfHeight = (imgHeightPx * pdfWidth) / imgWidthPx;

            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

            doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            doc.save(`Chefini_Grocery_${new Date().toISOString().split('T')[0]}.pdf`);

            showToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Failed to generate PDF', 'error');
        } finally {
            setExportLoading(false);
        }
    };

    // ------------------------------------
    // 📸 DOWNLOAD IMAGE
    // ------------------------------------
    const downloadImage = async () => {
        if (!result) return;

        const groceryItems = ingredients;
        setExportLoading(true);

        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            // @ts-ignore
            const html2canvas = window.html2canvas;

            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            tempDiv.style.width = '800px';
            tempDiv.style.background = 'white';
            tempDiv.style.padding = '0';
            tempDiv.style.boxSizing = 'border-box';

            tempDiv.innerHTML = getGroceryListHTML(groceryItems, result.batch_title);

            document.body.appendChild(tempDiv);
            await new Promise(r => setTimeout(r, 200));

            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#fff',
                scale: 2,
                logging: false,
                useCORS: true,
                width: 800
            });

            document.body.removeChild(tempDiv);

            canvas.toBlob((blob: Blob | null) => {
                if (!blob) throw new Error('Blob creation failed');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Chefini_Grocery_${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Image downloaded successfully!', 'success');
            }, 'image/png');
        } catch (error) {
            console.error(error);
            showToast('Failed to generate image', 'error');
        } finally {
            setExportLoading(false);
        }
    };

    // ------------------------------------
    // ❤️ SAVE TO COOKBOOK
    // ------------------------------------
    const saveToCookbook = async (recipe: RuntimeRecipe) => {
        try {
            const recipeData = {
                title: recipe.title,
                time: recipe.time,
                instructions: recipe.instructions,
                macros: recipe.macros,
                // Since this is a batch meal, we save the full batch ingredient list
                ingredients: ingredients.map(item => ({ item, missing: false })),
                tip: result?.storage_tip || 'Part of a Smart Meal Prep batch.',
            };

            const res = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData),
            });

            if (res.ok) {
                showToast(`Saved "${recipe.title}" to Cookbook!`, 'success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to save recipe', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to save recipe', 'error');
        }
    };

    // Shared HTML Generator
    const getGroceryListHTML = (items: string[], title: string) => `
        <div style="font-family: Arial, sans-serif; background: white; width: 800px;">
          <div style="background: #FFC72C; padding: 40px; text-align: center; border: 4px solid #000; border-bottom: none;">
            <div style="font-size: 48px; font-weight: 900; color: #000;">CHEFINI</div>
            <div style="font-size: 14px; color: #000; font-weight: bold; margin-top: 8px;">SMART MEAL PREP GROCERY LIST</div>
          </div>

          <div style="background: white; padding: 30px; text-align: center; border-left:4px solid #000; border-right:4px solid #000;">
            <div style="font-size: 14px; color: #666; font-weight: bold;">
              Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style="font-size: 18px; font-weight: 900; margin-top: 10px; color: #000;">
              🛒 ${items.length} Ingredients Required
            </div>
            <div style="font-size: 16px; font-bold; margin-top: 5px; color: #333;">
              ${title}
            </div>
          </div>

          <div style="padding: 40px; border-left:4px solid #000; border-right:4px solid #000; border-bottom:4px solid #000;">
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000; border-bottom: 2px solid #FFC72C; padding-bottom: 10px;">GROCERY ITEMS</h2>
              
              <div style="background: #f9f9f9; padding: 20px; border: 2px solid #ddd;">
                ${items.map((item, i) => `
                  <div style="display:flex; align-items:center; margin-bottom:15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
                    <div style="font-size: 16px; font-weight: 900; color: #FFC72C; width: 30px;">${i + 1}.</div>
                    <div style="width:20px; height:20px; border:2px solid #000; margin-right:15px; flex-shrink:0; background: white;"></div>
                    <div style="font-size:18px; font-weight: bold; color:#000;">${escapeHtml(item)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="background:#f5f5f5; padding:25px; text-align:center; border:4px solid #000; border-top:none;">
            <div style="font-size:14px; font-weight:bold; color:#000; margin-bottom:8px;">&copy; ${new Date().toLocaleDateString('en-IN', { year: 'numeric' })} Chefini. All rights reserved</div>
            <div style="font-size:12px; color:#666;">Crafted with ❤️ by RanitDERIA</div>
          </div>
        </div>
   `;

    const reset = () => {
        setStatus('idle');
        setIngredients([]);
        setDays(3);
        setCookingLevel('intermediate');
        setDietary([]);
        setCompletedSteps(new Set());
        setResult(null);
        setExpandedDay(null);
    };

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-4 md:p-6"
        >
            {/* Toast Container */}
            {toasts.map(toast => (
                <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
            ))}

            {/* Header Section */}
            <motion.div variants={itemAnim} className="mb-6 md:mb-8 bg-black border-4 border-chefini-yellow p-4 md:p-6">
                <h1 className="text-2xl md:text-4xl font-black flex items-center gap-3">
                    <Cpu className="text-chefini-yellow flex-shrink-0" size={32} />
                    SMART MEAL
                </h1>
                <p className="text-gray-400 mt-2">
                    Cook once (Sunday), eat differently all week. A smarter way to meal prep.
                </p>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

                {/* Left Sidebar - Input Form */}
                <motion.div variants={itemAnim} className="lg:col-span-1">
                    <div className="bg-black border-4 border-chefini-yellow p-4 md:p-6 lg:sticky lg:top-6 h-fit">
                        <h2 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-2">
                            <Plus className="text-chefini-yellow" />
                            PLAN SETTINGS
                        </h2>

                        {/* Ingredient Input */}
                        <div className={`mb-6 transition-all duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-black text-white mb-2">
                                WHAT INGREDIENTS DO YOU HAVE?
                            </label>
                            <TagInput
                                tags={ingredients}
                                onChange={setIngredients}
                                disabled={status !== 'idle'}
                                onValidate={validateContent}
                                onError={(msg) => showToast(msg, 'error')}
                            />
                            <p className="text-xs text-gray-400 mt-2 font-bold">
                                💡 Press Enter or click ADD after each ingredient
                            </p>
                        </div>

                        {/* Days Selector */}
                        <div className={`mb-6 transition-all duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-black text-white mb-2">
                                HOW MANY DAYS?
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {[2, 3, 4, 5].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d)}
                                        disabled={status !== 'idle'}
                                        className={`py-3 border-2 font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${days === d
                                            ? 'bg-chefini-yellow text-black border-chefini-yellow shadow-brutal-sm'
                                            : 'bg-transparent text-white border-white hover:bg-white/10'
                                            }`}
                                    >
                                        {d}D
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cooking Level */}
                        <div className={`mb-6 transition-all duration-300 ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-black text-white mb-2">
                                SKILL LEVEL
                            </label>
                            <select
                                value={cookingLevel}
                                onChange={(e) => setCookingLevel(e.target.value as any)}
                                disabled={status !== 'idle'}
                                className="w-full px-4 py-3 border-2 border-white bg-black text-white focus:outline-none focus:ring-2 focus:ring-chefini-yellow font-bold disabled:opacity-50"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Dietary Filters */}
                        <div className="mt-6">
                            <h3 className="font-black mb-3 text-white text-xs sm:text-sm">DIETARY PREFERENCES</h3>
                            <div className="flex flex-wrap gap-1">
                                {dietaryOptions.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() =>
                                            setDietary((prev) =>
                                                prev.includes(id)
                                                    ? prev.filter((d) => d !== id)
                                                    : [...prev, id]
                                            )
                                        }
                                        className={`px-2 py-2 border-2 font-bold flex items-center gap-1 transition-all text-xs sm:text-sm flex-1 justify-center whitespace-nowrap ${dietary.includes(id)
                                            ? 'bg-chefini-yellow text-black border-transparent'
                                            : 'bg-transparent sm:bg-white text-white sm:text-black border-white sm:border-black hover:bg-white/10 sm:hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Compile Button */}
                        {status === 'idle' && (
                            <button
                                onClick={handleCompile}
                                disabled={ingredients.length === 0}
                                className="w-full mt-6 py-4 bg-chefini-yellow border-4 border-black text-black text-xl font-black uppercase hover:shadow-brutal-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-brutal flex items-center justify-center gap-3"
                            >
                                <Play size={24} strokeWidth={3} />
                                GENERATE PLAN
                            </button>
                        )}

                        {/* View Saved Plans Button */}
                        <div className="mt-3">
                            <Link href="/batch/history">
                                <button className="w-full py-3 bg-white text-black font-bold border-2 border-white hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
                                    <Package size={18} />
                                    VIEW SAVED PLANS
                                </button>
                            </Link>
                        </div>

                        {/* Stats Display */}
                        <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-600">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-3xl font-black text-chefini-yellow mb-1">
                                        {ingredients.length}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        ITEMS
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-green-400 mb-1">
                                        {days}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        DAYS
                                    </div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-purple-400 mb-1">
                                        {cookingLevel[0].toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        LEVEL
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Results */}
                <motion.div variants={itemAnim} className="lg:col-span-2 space-y-6">

                    {/* Compiling State */}
                    {status === 'compiling' && (
                        <div className="bg-black border-4 border-chefini-yellow p-12 text-center">
                            <Terminal className="mx-auto mb-4 text-chefini-yellow animate-pulse" size={64} />
                            <h2 className="text-2xl font-black mb-2">CREATING YOUR PLAN...</h2>
                            <div className="font-mono text-sm text-gray-400 space-y-2 mt-4">
                                <p><span className="text-green-400">✓</span> Analyzing ingredients...</p>
                                <p><span className="text-green-400">✓</span> Planning prep steps...</p>
                                <p><span className="text-chefini-yellow animate-pulse">●</span> Creating daily recipes...</p>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {status === 'idle' && (
                        <div className="border-4 border-chefini-yellow bg-black p-12 text-center">
                            <Cpu size={64} className="mx-auto mb-4 text-chefini-yellow" />
                            <h2 className="text-2xl font-black mb-2">READY TO PLAN</h2>
                            <p className="text-gray-400">Add ingredients and click Generate to create your plan!</p>
                        </div>
                    )}

                    {/* Results */}
                    {status === 'compiled' && result && (
                        <div ref={resultRef} className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">

                            {/* Success Header */}
                            <div className="bg-chefini-yellow border-4 border-black shadow-brutal p-6">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={32} className="text-black flex-shrink-0" />
                                    <div>
                                        <h2 className="text-3xl font-black text-black mb-2">{result.batch_title}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-black font-bold">
                                            <div className="flex items-center gap-2">
                                                <Clock size={18} />
                                                <span>Total Prep: {result.total_prep_time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} />
                                                <span>{result.runtime_phase.length} Days</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BUILD PHASE - Terminal Style */}
                            <div className="bg-white border-4 border-black shadow-brutal">
                                <div className="bg-emerald-400 border-b-4 border-black p-4 flex items-center gap-2">
                                    <Terminal size={20} className="text-black hidden sm:block" />
                                    <h3 className="text-lg sm:text-xl font-black text-black">STEP 1: PREP DAY (SUNDAY)</h3>
                                </div>
                                <div className="p-4 sm:p-6 space-y-3">
                                    {result.build_phase.map((step, i) => {
                                        const isCompleted = completedSteps.has(i);
                                        return (
                                            <div key={i} className={`bg-gray-50 border-2 border-black p-3 sm:p-4 transition-opacity ${isCompleted ? 'opacity-50' : ''}`}>
                                                <div className="flex items-start gap-3">
                                                    {/* Checkbox */}
                                                    <button
                                                        onClick={() => toggleStep(i)}
                                                        className={`w-8 h-8 border-2 border-black flex items-center justify-center transition-colors flex-shrink-0 ${isCompleted ? 'bg-green-400' : 'bg-white'
                                                            }`}
                                                    >
                                                        {isCompleted && <CheckCircle2 size={20} className="text-black" />}
                                                    </button>

                                                    <span className="bg-chefini-yellow text-black w-8 h-8 flex items-center justify-center font-black text-lg border-2 border-black flex-shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-black text-black text-sm sm:text-base mb-2 break-words ${isCompleted ? 'line-through' : ''}`}>
                                                            {step.task}
                                                        </p>
                                                        <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-700 font-bold">
                                                            <span className="flex items-center gap-1">
                                                                <Timer size={14} /> {step.duration}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Thermometer size={14} /> {step.temp}
                                                            </span>
                                                        </div>
                                                        <div className="mt-2 bg-yellow-50 p-2 border-l-4 border-chefini-yellow">
                                                            <p className="text-xs sm:text-sm text-black font-bold flex items-start gap-2">
                                                                <Zap size={14} className="flex-shrink-0 mt-0.5" />
                                                                <span className="break-words">{step.why}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* RUNTIME PHASE - Card Grid */}
                            <div className="bg-white border-4 border-black shadow-brutal">
                                <div className="bg-violet-500 border-b-4 border-black p-4 flex items-center gap-2">
                                    <Play size={20} className="text-black hidden sm:block" />
                                    <h3 className="text-lg sm:text-xl font-black text-black uppercase">STEP 2: Daily Assembly</h3>
                                </div>
                                <div className="p-4 sm:p-6 space-y-4">
                                    {result.runtime_phase.map((recipe) => {
                                        const isExpanded = expandedDay === recipe.day;
                                        return (
                                            <div key={recipe.day} className="border-4 border-black shadow-brutal">
                                                {/* Day Header */}
                                                <button
                                                    onClick={() => setExpandedDay(isExpanded ? null : recipe.day)}
                                                    className="w-full bg-chefini-yellow p-3 sm:p-4 flex items-center justify-between hover:bg-yellow-300 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 text-left">
                                                        <div className="bg-black text-chefini-yellow w-8 h-8 sm:w-10 sm:h-10 flex flex-shrink-0 items-center justify-center font-black text-lg sm:text-xl border-2 border-black">
                                                            {recipe.day}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="font-black text-black text-base sm:text-lg break-words">{recipe.title}</h4>
                                                            <p className="text-xs sm:text-sm text-gray-700 font-bold">{recipe.time}</p>
                                                        </div>
                                                    </div>
                                                    {isExpanded ? <ChevronUp className="text-black flex-shrink-0" /> : <ChevronDown className="text-black flex-shrink-0" />}
                                                </button>

                                                {/* Expanded Content */}
                                                {isExpanded && (
                                                    <div className="bg-white p-4 sm:p-6 border-t-4 border-black">
                                                        {/* Instructions */}
                                                        <div className="mb-4">
                                                            <h5 className="font-black text-black mb-3 flex items-center gap-2 text-sm sm:text-base">
                                                                <Utensils size={18} /> ASSEMBLY STEPS
                                                            </h5>
                                                            <ol className="space-y-3">
                                                                {recipe.instructions.map((step, i) => (
                                                                    <li key={i} className="flex gap-3">
                                                                        <span className="font-black text-chefini-yellow text-base sm:text-lg">{i + 1}.</span>
                                                                        <span className="font-bold text-black flex-1 text-sm sm:text-base">{step}</span>
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </div>

                                                        {/* Macros */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 border-4 border-black mb-4">
                                                            <div className="text-center">
                                                                <div className="text-xl sm:text-2xl font-black text-black">{recipe.macros.calories}</div>
                                                                <div className="text-xs text-gray-600 font-bold">CAL</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xl sm:text-2xl font-black text-red-600">{recipe.macros.protein}g</div>
                                                                <div className="text-xs text-gray-600 font-bold">PRO</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xl sm:text-2xl font-black text-blue-600">{recipe.macros.carbs}g</div>
                                                                <div className="text-xs text-gray-600 font-bold">CARB</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-xl sm:text-2xl font-black text-yellow-600">{recipe.macros.fats}g</div>
                                                                <div className="text-xs text-gray-600 font-bold">FAT</div>
                                                            </div>
                                                        </div>

                                                        {/* Save to Cookbook Button */}
                                                        <button
                                                            onClick={() => saveToCookbook(recipe)}
                                                            className="w-full py-3 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            <BookHeart size={18} className="text-chefini-yellow" />
                                                            SAVE TO COOKBOOK
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Storage Tip */}
                            <div className="bg-blue-50 border-4 border-black p-4 flex items-start gap-3 shadow-brutal-sm">
                                <Package className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <span className="font-black block text-xs sm:text-sm text-blue-600 mb-1 uppercase">STORAGE TIP:</span>
                                    <p className="text-sm text-blue-900 font-bold">
                                        {result.storage_tip}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3 sm:space-y-4">
                                {/* Export Options */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={downloadPDF}
                                        disabled={exportLoading}
                                        className="w-full py-3 bg-white text-black font-black border-2 border-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                                    >
                                        <FileText size={18} /> PDF
                                    </button>
                                    <button
                                        onClick={downloadImage}
                                        disabled={exportLoading}
                                        className="w-full py-3 bg-white text-black font-black border-2 border-black hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                                    >
                                        <ImageIcon size={18} /> IMAGE
                                    </button>
                                </div>

                                <button
                                    onClick={reset}
                                    className="w-full py-3 sm:py-4 bg-black text-white font-black uppercase hover:bg-gray-800 transition-all flex items-center justify-center gap-2 border-4 border-black shadow-brutal hover:shadow-brutal-lg text-sm sm:text-base"
                                >
                                    <RotateCcw size={20} /> START NEW PLAN
                                </button>
                            </div>
                        </div>
                    )}

                </motion.div>
            </div>
        </motion.div>
    );
}