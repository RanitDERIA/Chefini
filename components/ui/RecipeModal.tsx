// components/ui/RecipeModal.tsx
'use client';

import {
    X,
    Download,
    BookmarkPlus,
    Heart,
    ShoppingCart,
    Volume2,
    Sparkles,
    Globe,
    Trash2,
    Share2,
    ListPlus,
    MoreHorizontal,
    ChevronUp,
    ChevronDown,
    ChefHat // IMPORTED: ChefHat Icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // IMPORTED

import { useState } from 'react';
import CookMode from './CookMode'; // IMPORTED: CookMode Component

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

interface Recipe {
    _id?: string;
    title: string;
    time: string;
    ingredients: Array<{ item: string; missing?: boolean }>;
    instructions: string[];
    macros: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    tip: string;
    likes?: number;
    createdBy?: {
        name: string;
        image?: string;
        avatar?: string;
    };
    isPublic?: boolean;
}

interface RecipeModalProps {
    recipe: Recipe | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveToCookbook?: (recipe: Recipe) => void;
    onLike?: (recipeId: string) => void;
    onTogglePublic?: () => void;
    onDelete?: () => void;
    onAddToShoppingList?: (recipe: Recipe) => void;
    onShare?: (recipe: Recipe) => void;
    showActions?: boolean;
    showToast?: (
        message: string,
        type: 'success' | 'error' | 'info'
    ) => void;
    isLiked?: boolean;
    isOwner?: boolean;
    isPublic?: boolean;
}

export default function RecipeModal({
    recipe,
    isOpen,
    onClose,
    onSaveToCookbook,
    onLike,
    onTogglePublic,
    onDelete,
    onAddToShoppingList,
    onShare,
    showActions = true,
    showToast,
    isLiked = false,
    isOwner = false,
    isPublic = false
}: RecipeModalProps) {
    const [isReading, setIsReading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // NEW STATE: Toggle for Cook Mode Overlay
    const [isCookMode, setIsCookMode] = useState(false);

    // if (!isOpen || !recipe) return null; // MOVED TO RENDER LOGIC FOR ANIMATION

    // ------------------------------------
    // 🔊 SPEAK INSTRUCTIONS
    // ------------------------------------
    const speakInstructions = () => {
        if (!recipe || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        if (!isReading) {
            const text = recipe.instructions
                .map((step, i) => `Step ${i + 1}. ${step}`)
                .join('. ');

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.onend = () => setIsReading(false);

            window.speechSynthesis.speak(utterance);
            setIsReading(true);
        } else {
            setIsReading(false);
        }
    };

    // ------------------------------------
    // 🔗 HANDLE SHARE
    // ------------------------------------
    const handleShare = async () => {
        if (!recipe) return;

        if (onShare) {
            onShare(recipe);
            return;
        }

        // Default share behavior if no prop provided
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Chefini: ${recipe.title}`,
                    text: `Check out this recipe for ${recipe.title}! ⏱️ ${recipe.time} • 🔥 ${recipe.macros.calories} cal`,
                    url: window.location.href,
                });
                showToast?.('Recipe shared successfully!', 'success');
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(`${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => i.item).join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`);
                showToast?.('Recipe details copied to clipboard!', 'success');
            } catch (err) {
                showToast?.('Failed to share recipe', 'error');
            }
        }
    };

    // ------------------------------------
    // 📄 DOWNLOAD PDF (Exact Image Match)
    // ------------------------------------
    const downloadPDF = async () => {
        if (!recipe) return;
        setDownloading(true);

        try {
            // Load BOTH jsPDF and html2canvas
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

            // @ts-ignore
            const { jsPDF } = window.jspdf;
            // @ts-ignore
            const html2canvas = window.html2canvas;

            // 1. Generate HTML (Exact copy of image generation logic)
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            tempDiv.style.width = '800px'; // consistent width
            tempDiv.style.background = 'white';
            tempDiv.style.padding = '0';
            tempDiv.style.boxSizing = 'border-box';

            // *** EXACT HTML TEMPLATE USED IN DOWNLOAD IMAGE ***
            tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; background: white; width: 800px;">
          <div style="background: #FFC72C; padding: 40px; text-align: center; border: 4px solid #000; border-bottom: none;">
            <div style="font-size: 48px; font-weight: 900; color: #000;">CHEFINI</div>
            <div style="font-size: 14px; color: #000; font-weight: bold; margin-top: 8px;">Turn Leftovers into Magic</div>
          </div>

          <div style="background: white; padding: 30px; text-align: center; border-left:4px solid #000; border-right:4px solid #000;">
            <h1 style="font-size: 36px; font-weight: 900; margin: 0 0 15px 0; color: #000;">${escapeHtml(recipe.title)}</h1>
            <div style="font-size: 14px; color: #666; font-weight: bold;">
              ⏱️ ${escapeHtml(recipe.time)} • 🔥 ${recipe.macros.calories} cal • 🥘 ${recipe.ingredients.length} ingredients
            </div>
          </div>

          <div style="padding: 40px; border-left:4px solid #000; border-right:4px solid #000; border-bottom:4px solid #000;">
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000;">🛒 INGREDIENTS</h2>
              <div style="background: #f9f9f9; padding: 20px; border: 2px solid #ddd;">
                ${recipe.ingredients.map(ing => `
                  <div style="display:flex; align-items:center; margin-bottom:10px;">
                    <div style="width:16px; height:16px; border:2px solid #000; margin-right:12px; flex-shrink:0;"></div>
                    <div style="font-size:16px; color:#000;">${escapeHtml(ing.item)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000;">👨‍🍳 INSTRUCTIONS</h2>
              ${recipe.instructions.map((step, idx) => `
                <div style="display:flex; margin-bottom:15px;">
                  <div style="font-size:20px; font-weight:900; color:#FFC72C; margin-right:12px; min-width:30px;">${idx + 1}.</div>
                  <div style="font-size:16px; line-height:1.6; color:#000;">${escapeHtml(step)}</div>
                </div>
              `).join('')}
            </div>

            <div style="background:#FFFACD; border:3px solid #FFC72C; padding:20px; margin-bottom:30px;">
              <h3 style="font-size:20px; font-weight:900; margin:0 0 10px 0; color:#000;">✨ CHEFINI'S MAGIC TIP</h3>
              <p style="font-size:14px; line-height:1.6; margin:0; color:#000; font-style:italic;">${escapeHtml(recipe.tip)}</p>
            </div>

            <div>
              <h2 style="font-size:24px; font-weight:900; margin-bottom:15px; color:#000;">📊 NUTRITIONAL INFORMATION</h2>
              <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px;">
                <div style="text-align:center; padding:20px; background:#FFF5E6; border:2px solid #FFD700;">
                  <div style="font-size:32px; font-weight:900; color:#FF8C00;">${recipe.macros.calories}</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">CALORIES</div>
                </div>
                <div style="text-align:center; padding:20px; background:#E6FFE6; border:2px solid #90EE90;">
                  <div style="font-size:32px; font-weight:900; color:#228B22;">${recipe.macros.protein}g</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">PROTEIN</div>
                </div>
                <div style="text-align:center; padding:20px; background:#FFE6F0; border:2px solid #FFB6C1;">
                  <div style="font-size:32px; font-weight:900; color:#DC143C;">${recipe.macros.carbs}g</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">CARBS</div>
                </div>
                <div style="text-align:center; padding:20px; background:#E6F3FF; border:2px solid #87CEEB;">
                  <div style="font-size:32px; font-weight:900; color:#1E90FF;">${recipe.macros.fats}g</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">FATS</div>
                </div>
              </div>
            </div>
          </div>

          <div style="background:#f5f5f5; padding:25px; text-align:center; border:4px solid #000; border-top:none;">
            <div style="font-size:14px; font-weight:bold; color:#000; margin-bottom:8px;">&copy; ${new Date().toLocaleDateString('en-IN', { year: 'numeric' })} Chefini. All rights reserved</div>
            <div style="font-size:12px; color:#666;">Crafted with ❤️ by RanitDERIA</div>
            <div style="font-size:11px; color:#999; margin-top:8px;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      `;

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

            // 4. Calculate Dimensions (CRITICAL FIX FOR FOOTER/TIP)
            const imgData = canvas.toDataURL('image/png');
            const imgWidthPx = canvas.width;
            const imgHeightPx = canvas.height;

            // standardise width to A4 width (210mm)
            const pdfWidth = 210;
            const pdfHeight = (imgHeightPx * pdfWidth) / imgWidthPx;

            // 5. Initialize PDF with CUSTOM page size to fit everything
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

            // 6. Add image filling the exact custom page
            doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // 7. Save
            const fileName = recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            doc.save(`chefini_${fileName}.pdf`);

            showToast?.('PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error('PDF generation error:', err);
            showToast?.('Failed to generate PDF', 'error');
        } finally {
            setDownloading(false);
        }
    };

    // ------------------------------------
    // 📸 DOWNLOAD IMAGE
    // ------------------------------------
    const downloadImage = async () => {
        if (!recipe) return;
        setDownloading(true);

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

            // *** EXACT HTML TEMPLATE ***
            tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; background: white; width: 800px;">
          <div style="background: #FFC72C; padding: 40px; text-align: center; border: 4px solid #000; border-bottom: none;">
            <div style="font-size: 48px; font-weight: 900; color: #000;">CHEFINI</div>
            <div style="font-size: 14px; color: #000; font-weight: bold; margin-top: 8px;">Turn Leftovers into Magic</div>
          </div>

          <div style="background: white; padding: 30px; text-align: center; border-left:4px solid #000; border-right:4px solid #000;">
            <h1 style="font-size: 36px; font-weight: 900; margin: 0 0 15px 0; color: #000;">${escapeHtml(recipe.title)}</h1>
            <div style="font-size: 14px; color: #666; font-weight: bold;">
              ⏱️ ${escapeHtml(recipe.time)} • 🔥 ${recipe.macros.calories} cal • 🥘 ${recipe.ingredients.length} ingredients
            </div>
          </div>

          <div style="padding: 40px; border-left:4px solid #000; border-right:4px solid #000; border-bottom:4px solid #000;">
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000;">🛒 INGREDIENTS</h2>
              <div style="background: #f9f9f9; padding: 20px; border: 2px solid #ddd;">
                ${recipe.ingredients.map(ing => `
                  <div style="display:flex; align-items:center; margin-bottom:10px;">
                    <div style="width:16px; height:16px; border:2px solid #000; margin-right:12px; flex-shrink:0;"></div>
                    <div style="font-size:16px; color:#000;">${escapeHtml(ing.item)}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000;">👨‍🍳 INSTRUCTIONS</h2>
              ${recipe.instructions.map((step, idx) => `
                <div style="display:flex; margin-bottom:15px;">
                  <div style="font-size:20px; font-weight:900; color:#FFC72C; margin-right:12px; min-width:30px;">${idx + 1}.</div>
                  <div style="font-size:16px; line-height:1.6; color:#000;">${escapeHtml(step)}</div>
                </div>
              `).join('')}
            </div>

            <div style="background:#FFFACD; border:3px solid #FFC72C; padding:20px; margin-bottom:30px;">
              <h3 style="font-size:20px; font-weight:900; margin:0 0 10px 0; color:#000;">✨ CHEFINI'S MAGIC TIP</h3>
              <p style="font-size:14px; line-height:1.6; margin:0; color:#000; font-style:italic;">${escapeHtml(recipe.tip)}</p>
            </div>

            <div>
              <h2 style="font-size:24px; font-weight:900; margin-bottom:15px; color:#000;">📊 NUTRITIONAL INFORMATION</h2>
              <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:15px;">
                <div style="text-align:center; padding:20px; background:#FFF5E6; border:2px solid #FFD700;">
                  <div style="font-size:32px; font-weight:900; color:#FF8C00;">${recipe.macros.calories}</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">CALORIES</div>
                </div>
                <div style="text-align:center; padding:20px; background:#E6FFE6; border:2px solid #90EE90;">
                  <div style="font-size:32px; font-weight:900; color:#228B22;">${recipe.macros.protein}g</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">PROTEIN</div>
                </div>
                <div style="text-align:center; padding:20px; background:#FFE6F0; border:2px solid #FFB6C1;">
                  <div style="font-size:32px; font-weight:900; color:#DC143C;">${recipe.macros.carbs}g</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">CARBS</div>
                </div>
                <div style="text-align:center; padding:20px; background:#E6F3FF; border:2px solid #87CEEB;">
                  <div style="font-size:32px; font-weight:900; color:#1E90FF;">${recipe.macros.fats}g</div>
                  <div style="font-size:12px; font-weight:bold; color:#000; margin-top:5px;">FATS</div>
                </div>
              </div>
            </div>
          </div>

          <div style="background:#f5f5f5; padding:25px; text-align:center; border:4px solid #000; border-top:none;">
            <div style="font-size:14px; font-weight:bold; color:#000; margin-bottom:8px;">&copy; ${new Date().toLocaleDateString('en-IN', { year: 'numeric' })} Chefini. All rights reserved</div>
            <div style="font-size:12px; color:#666;">Crafted with ❤️ by RanitDERIA</div>
            <div style="font-size:11px; color:#999; margin-top:8px;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      `;

            document.body.appendChild(tempDiv);
            await new Promise(r => setTimeout(r, 150));

            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#fff',
                scale: 2,
                logging: false,
                useCORS: true,
                width: 800
            });

            document.body.removeChild(tempDiv);

            // Fix: Explicitly type 'blob' as Blob | null
            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    showToast?.('Failed to generate image', 'error');
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const fileName = recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                a.href = url;
                a.download = `chefini_${fileName}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast?.('Image downloaded successfully!', 'success');
            }, 'image/png');
        } catch (err) {
            console.error('Image generation error:', err);
            showToast?.('Failed to generate image', 'error');
        } finally {
            setDownloading(false);
        }
    };

    // -------------------------
    // Render JSX (Modal UI)
    // -------------------------
    // -------------------------
    // Render JSX (Modal UI)
    // -------------------------
    // Function to handle internal conditional rendering for animation
    const showModal = isOpen && recipe;

    return (
        <AnimatePresence>
            {showModal && recipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 overflow-hidden">

                    {/* NEW: RENDER COOK MODE OVERLAY IF ACTIVE */}
                    {isCookMode && (
                        <CookMode
                            instructions={recipe.instructions}
                            title={recipe.title}
                            onClose={() => setIsCookMode(false)}
                        />
                    )}

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-70"
                        onClick={onClose}
                    />

                    {/* Modal container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative bg-white border-4 border-black shadow-brutal-lg max-w-4xl w-full flex flex-col max-h-[90vh] z-10"
                    >

                        {/* Header */}
                        <div className="bg-chefini-yellow border-b-4 border-black p-4 md:p-6 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-2xl md:text-3xl font-black text-black mb-2 selectable">{recipe.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-xs md:text-sm font-bold text-black">
                                        <span>⏱️ {recipe.time}</span>
                                        <span>🔥 {recipe.macros.calories} cal</span>
                                        {recipe.createdBy && <span>👨‍🍳 By {recipe.createdBy.name}</span>}
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 bg-black text-white hover:bg-gray-800 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Action buttons */}
                            {showActions && (
                                <>
                                    {/* --- DESKTOP ACTIONS (Hidden on Mobile) --- */}
                                    <div className="hidden md:flex mt-4 flex-wrap gap-2">

                                        {/* NEW: START COOKING BUTTON (Prominent) */}
                                        <button
                                            onClick={() => setIsCookMode(true)}
                                            className="px-6 py-2 bg-white text-black font-black border-2 border-black hover:bg-black hover:text-chefini-yellow flex items-center gap-2 text-lg shadow-brutal-sm hover:shadow-none transition-all transform hover:translate-x-[2px] hover:translate-y-[2px]"
                                        >
                                            <ChefHat size={22} /> START COOKING
                                        </button>

                                        <button
                                            onClick={downloadPDF}
                                            disabled={downloading}
                                            className="px-4 py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Download size={18} /> PDF
                                        </button>

                                        <button
                                            onClick={downloadImage}
                                            disabled={downloading}
                                            className="px-4 py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <Download size={18} /> Image
                                        </button>

                                        {onAddToShoppingList && (
                                            <button
                                                onClick={() => onAddToShoppingList(recipe)}
                                                className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black hover:bg-blue-600 flex items-center gap-2"
                                            >
                                                <ListPlus size={18} /> Add to List
                                            </button>
                                        )}

                                        {!isOwner && onSaveToCookbook && (
                                            <button
                                                onClick={() => onSaveToCookbook(recipe)}
                                                className="px-4 py-2 bg-green-400 text-black font-bold border-2 border-black hover:bg-green-500 flex items-center gap-2"
                                            >
                                                <BookmarkPlus size={18} /> Save to Cookbook
                                            </button>
                                        )}

                                        {isOwner && onTogglePublic && (
                                            <button
                                                onClick={onTogglePublic}
                                                className={`px-4 py-2 font-bold border-2 border-black flex items-center gap-2 transition-colors ${isPublic
                                                    ? 'bg-green-400 text-black hover:bg-green-500'
                                                    : 'bg-gray-200 text-black hover:bg-gray-300'
                                                    }`}
                                            >
                                                <Globe size={18} />
                                                {isPublic ? 'Make Private' : 'Make Public'}
                                            </button>
                                        )}

                                        {isOwner && onDelete && (
                                            <button
                                                onClick={onDelete}
                                                className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 flex items-center gap-2"
                                            >
                                                <Trash2 size={18} />
                                                Delete
                                            </button>
                                        )}

                                        {!isOwner && onLike && recipe._id && (
                                            <button
                                                onClick={() => onLike(recipe._id!)}
                                                className={`px-4 py-2 font-bold border-2 border-black flex items-center gap-2 transition-all ${isLiked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-red-100'
                                                    }`}
                                                title={isLiked ? 'Unlike' : 'Like'}
                                            >
                                                <Heart size={18} className={isLiked ? 'fill-white' : 'fill-none'} />
                                                {recipe.likes || 0}
                                            </button>
                                        )}

                                        <button
                                            onClick={handleShare}
                                            className="px-4 py-2 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 flex items-center gap-2"
                                        >
                                            <Share2 size={18} /> Share
                                        </button>

                                        <button
                                            onClick={speakInstructions}
                                            className={`px-4 py-2 font-bold border-2 border-black flex items-center gap-2 transition-colors ${isReading
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-blue-600 hover:bg-blue-50'
                                                }`}
                                        >
                                            <Volume2 size={18} /> {isReading ? 'Stop' : 'Read'}
                                        </button>
                                    </div>

                                    {/* --- MOBILE ACTIONS (Visible on Mobile) --- */}
                                    <div className="md:hidden mt-4">

                                        {/* NEW: Mobile Prominent Start Cooking Button */}
                                        <button
                                            onClick={() => setIsCookMode(true)}
                                            className="w-full mb-3 py-3 bg-white text-black font-black border-2 border-black flex items-center justify-center gap-2 shadow-brutal-sm active:shadow-none active:translate-y-1"
                                        >
                                            <ChefHat size={20} /> START COOKING
                                        </button>

                                        <div className="flex items-center gap-2 justify-between">
                                            <div className="flex gap-2">
                                                {!isOwner && onLike && recipe._id && (
                                                    <button
                                                        onClick={() => onLike(recipe._id!)}
                                                        className={`p-2 font-bold border-2 border-black flex items-center gap-2 transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
                                                    >
                                                        <Heart size={20} className={isLiked ? 'fill-white' : 'fill-none'} />
                                                        {recipe.likes || 0}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={handleShare}
                                                    className="p-2 bg-white text-black font-bold border-2 border-black hover:bg-gray-100"
                                                >
                                                    <Share2 size={20} />
                                                </button>

                                                <button
                                                    onClick={speakInstructions}
                                                    className={`p-2 font-bold border-2 border-black transition-colors ${isReading ? 'bg-blue-600' : 'bg-white'}`}
                                                >
                                                    <Volume2 size={20} className={isReading ? 'animate-pulse text-white' : 'text-blue-600'} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                                className="px-3 py-2 bg-black text-white font-bold border-2 border-black flex items-center gap-1 text-sm"
                                            >
                                                <MoreHorizontal size={18} /> Actions
                                                {showMobileMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>

                                        {/* Expanded Mobile Menu */}
                                        {showMobileMenu && (
                                            <div className="mt-3 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                                <button
                                                    onClick={downloadPDF}
                                                    disabled={downloading}
                                                    className="p-2 bg-white text-black font-bold border-2 border-black flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Download size={16} /> Save PDF
                                                </button>

                                                <button
                                                    onClick={downloadImage}
                                                    disabled={downloading}
                                                    className="p-2 bg-white text-black font-bold border-2 border-black flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Download size={16} /> Save Image
                                                </button>

                                                {onAddToShoppingList && (
                                                    <button
                                                        onClick={() => onAddToShoppingList(recipe)}
                                                        className="p-2 bg-blue-100 text-black font-bold border-2 border-black flex items-center justify-center gap-2 text-sm col-span-2"
                                                    >
                                                        <ListPlus size={16} /> Add Ingredients to List
                                                    </button>
                                                )}

                                                {!isOwner && onSaveToCookbook && (
                                                    <button
                                                        onClick={() => onSaveToCookbook(recipe)}
                                                        className="p-2 bg-green-100 text-black font-bold border-2 border-black flex items-center justify-center gap-2 text-sm col-span-2"
                                                    >
                                                        <BookmarkPlus size={16} /> Save to Cookbook
                                                    </button>
                                                )}

                                                {isOwner && onTogglePublic && (
                                                    <button
                                                        onClick={onTogglePublic}
                                                        className="p-2 bg-gray-100 text-black font-bold border-2 border-black flex items-center justify-center gap-2 text-sm col-span-2"
                                                    >
                                                        <Globe size={16} />
                                                        {isPublic ? 'Make Private' : 'Make Public'}
                                                    </button>
                                                )}

                                                {isOwner && onDelete && (
                                                    <button
                                                        onClick={onDelete}
                                                        className="p-2 bg-red-100 text-red-900 font-bold border-2 border-black flex items-center justify-center gap-2 text-sm col-span-2"
                                                    >
                                                        <Trash2 size={16} /> Delete Recipe
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Content */}
                        <div id="recipe-modal-content" className="p-4 md:p-6 bg-white text-black overflow-y-auto flex-1">

                            {/* Ingredients */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl md:text-2xl font-black flex items-center gap-2">
                                        <ShoppingCart size={24} /> INGREDIENTS
                                    </h3>
                                    <button
                                        onClick={() => {
                                            const text = recipe.ingredients.map(ing => `- ${ing.item}`).join('\n');
                                            navigator.clipboard.writeText(text)
                                                .then(() => showToast?.('Ingredients copied to clipboard!', 'success'))
                                                .catch(() => showToast?.('Failed to copy', 'error'));
                                        }}
                                        className="text-sm font-bold border-2 border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
                                    >
                                        Copy List
                                    </button>
                                </div>
                                <ul className="space-y-2 selectable">
                                    {recipe.ingredients.map((ing, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-base md:text-lg">
                                            <span className="font-mono text-chefini-yellow">▪</span>
                                            <span>{ing.item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div className="mb-6">
                                <h3 className="text-xl md:text-2xl font-black mb-4">INSTRUCTIONS</h3>
                                <ol className="space-y-4 selectable">
                                    {recipe.instructions.map((step, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <span className="font-black text-lg md:text-xl text-chefini-yellow min-w-[30px]">{idx + 1}.</span>
                                            <span className="text-base md:text-lg">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Magic Tip */}
                            <div className="border-4 border-chefini-yellow bg-chefini-yellow bg-opacity-20 p-4 md:p-6 mb-6">
                                <h3 className="text-lg md:text-xl font-black mb-3 flex items-center gap-2">
                                    <Sparkles size={20} /> CHEFINI'S MAGIC TIP
                                </h3>
                                <p className="text-sm md:text-base selectable">{recipe.tip}</p>
                            </div>

                            {/* Macros */}
                            <div className="border-t-4 border-dashed border-black pt-6">
                                <h3 className="text-lg md:text-xl font-black mb-4">NUTRITIONAL INFO</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="font-black text-2xl md:text-3xl text-chefini-yellow">{recipe.macros.calories}</div>
                                        <div className="text-xs md:text-sm font-bold">CALORIES</div>
                                    </div>
                                    <div>
                                        <div className="font-black text-2xl md:text-3xl text-chefini-yellow">{recipe.macros.protein}g</div>
                                        <div className="text-xs md:text-sm font-bold">PROTEIN</div>
                                    </div>
                                    <div>
                                        <div className="font-black text-2xl md:text-3xl text-chefini-yellow">{recipe.macros.carbs}g</div>
                                        <div className="text-xs md:text-sm font-bold">CARBS</div>
                                    </div>
                                    <div>
                                        <div className="font-black text-2xl md:text-3xl text-chefini-yellow">{recipe.macros.fats}g</div>
                                        <div className="text-xs md:text-sm font-bold">FATS</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// -------------------------
// Utilities
// -------------------------
function escapeHtml(input: string) {
    return String(input)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}