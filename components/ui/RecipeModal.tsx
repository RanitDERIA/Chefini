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
    ChefHat
} from 'lucide-react';
import { useState } from 'react';
import CookMode from './CookMode';

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

// Helper to escape HTML entities
const escapeHtml = (str: string) => {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
    const [cookModeOpen, setCookModeOpen] = useState(false);

    if (!isOpen || !recipe) return null;

    // ------------------------------------
    // 🔊 SPEAK INSTRUCTIONS
    // ------------------------------------
    const speakInstructions = () => {
        if (!('speechSynthesis' in window)) return;
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
        if (onShare) {
            onShare(recipe);
            return;
        }
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Chefini: ${recipe.title}`,
                    text: `Check out this recipe for ${recipe.title}! ⏱️ ${recipe.time} • 🔥 ${recipe.macros.calories} cal`,
                    url: window.location.href,
                });
                showToast?.('Recipe shared successfully!', 'success');
            } catch (error) {
                if (String(error).indexOf('AbortError') === -1) {
                    console.log('Error sharing:', error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => i.item).join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`);
                showToast?.('Recipe details copied to clipboard!', 'success');
            } catch (err) {
                showToast?.('Failed to share recipe', 'error');
            }
        }
    };

    // ------------------------------------
    // 📄 DOWNLOAD PDF
    // ------------------------------------
    const downloadPDF = async () => {
        setDownloading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');

            // @ts-ignore
            const { jsPDF } = window.jspdf;
            // @ts-ignore
            const html2canvas = window.html2canvas;

            const tempDiv = document.createElement('div');
            Object.assign(tempDiv.style, {
                position: 'fixed',
                left: '-9999px',
                top: '0',
                width: '800px',
                background: 'white',
                padding: '0',
                boxSizing: 'border-box'
            });

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
        setDownloading(true);
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            // @ts-ignore
            const html2canvas = window.html2canvas;

            const tempDiv = document.createElement('div');
            Object.assign(tempDiv.style, {
                position: 'fixed',
                left: '-9999px',
                top: '0',
                width: '800px',
                background: 'white',
                padding: '0',
                boxSizing: 'border-box'
            });

            // Same template string as above... (simplified for brevity)
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
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 overflow-hidden">
                <div
                    className="absolute inset-0 bg-black bg-opacity-70"
                    onClick={onClose}
                ></div>
                <div className="relative bg-white border-4 border-black shadow-brutal-lg max-w-4xl w-full flex flex-col max-h-[90vh]">
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
                        {/* 🔥 NEW: START COOKING BUTTON - PROMINENT PLACEMENT */}
                        <div className="mt-4 mb-2">
                            <button
                                onClick={() => setCookModeOpen(true)}
                                className="w-full py-4 bg-chefini-yellow text-black font-black text-lg md:text-xl border-4 border-black hover:bg-yellow-400 transition-all shadow-brutal flex items-center justify-center gap-3 active:translate-y-1"
                            >
                                <ChefHat size={28} />
                                START COOKING (HANDS-FREE MODE)
                            </button>
                        </div>
                        {/* Action buttons */}
                        {showActions && (
                            <>
                                {/* --- DESKTOP ACTIONS (Hidden on Mobile) --- */}
                                <div className="hidden md:flex mt-4 flex-wrap gap-2">
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
                                    <div className="flex items-center gap-2 justify-between">
                                        <div className="flex gap-2">
                                            {!isOwner && onLike && recipe._id && (
                                                <button
                                                    onClick={() => onLike(recipe._id!)}
                                                    className={`p-2 font-bold border-2 border-black transition-all ${isLiked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-red-100'
                                                        }`}
                                                    title={isLiked ? 'Unlike' : 'Like'}
                                                >
                                                    <Heart size={20} className={isLiked ? 'fill-white' : 'fill-none'} />
                                                </button>
                                            )}
                                            {onAddToShoppingList && (
                                                <button
                                                    onClick={() => onAddToShoppingList(recipe)}
                                                    className="p-2 bg-blue-500 text-white font-bold border-2 border-black hover:bg-blue-600"
                                                    title="Add to Shopping List"
                                                >
                                                    <ListPlus size={20} />
                                                </button>
                                            )}
                                            {!isOwner && onSaveToCookbook && (
                                                <button
                                                    onClick={() => onSaveToCookbook(recipe)}
                                                    className="p-2 bg-green-400 text-black font-bold border-2 border-black hover:bg-green-500"
                                                    title="Save to Cookbook"
                                                >
                                                    <BookmarkPlus size={20} />
                                                </button>
                                            )}
                                            <button
                                                onClick={speakInstructions}
                                                className={`p-2 font-bold border-2 border-black transition-colors ${isReading
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                title={isReading ? 'Stop Reading' : 'Read Instructions'}
                                            >
                                                <Volume2 size={20} />
                                            </button>
                                        </div>
                                        {/* Mobile Menu Toggle */}
                                        <button
                                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                                            className="p-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-800"
                                            title="More Actions"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                    {/* Mobile Menu Dropdown */}
                                    <div
                                        className={`mt-2 bg-white border-2 border-black transition-all overflow-hidden ${showMobileMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                    >
                                        <div className="flex flex-col gap-1 p-2">
                                            <button
                                                onClick={handleShare}
                                                className="w-full text-left px-3 py-2 bg-white text-black font-bold border border-transparent hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Share2 size={18} /> Share
                                            </button>
                                            <button
                                                onClick={downloadPDF}
                                                disabled={downloading}
                                                className="w-full text-left px-3 py-2 bg-white text-black font-bold border border-transparent hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Download size={18} /> Download PDF
                                            </button>
                                            <button
                                                onClick={downloadImage}
                                                disabled={downloading}
                                                className="w-full text-left px-3 py-2 bg-white text-black font-bold border border-transparent hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Download size={18} /> Download Image
                                            </button>

                                            {isOwner && onTogglePublic && (
                                                <button
                                                    onClick={onTogglePublic}
                                                    className={`w-full text-left px-3 py-2 font-bold border border-transparent flex items-center gap-2 transition-colors ${isPublic
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
                                                    className="w-full text-left px-3 py-2 bg-red-500 text-white font-bold border border-transparent hover:bg-red-600 flex items-center gap-2"
                                                >
                                                    <Trash2 size={18} />
                                                    Delete Recipe
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8">
                        {/* Ingredients */}
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-black border-b-4 border-black pb-2 mb-4 flex items-center gap-2">
                                🛒 Ingredients
                            </h3>
                            <ul className="space-y-3">
                                {recipe.ingredients.map((ing, index) => (
                                    <li
                                        key={index}
                                        className={`flex items-start gap-3 text-base md:text-lg font-medium p-2 border-b-2 ${ing.missing ? 'text-red-600 border-red-300' : 'text-black border-gray-200'
                                            }`}
                                    >
                                        <span className="text-chefini-yellow">
                                            {ing.missing ? <X size={20} className="stroke-red-600" /> : '•'}
                                        </span>
                                        <span className="selectable">{ing.item}</span>
                                        {ing.missing && (
                                            <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-auto">
                                                Missing
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Instructions */}
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-black border-b-4 border-black pb-2 mb-4 flex items-center gap-2">
                                👨‍🍳 Instructions
                            </h3>
                            <ol className="space-y-4">
                                {recipe.instructions.map((step, index) => (
                                    <li key={index} className="flex items-start gap-3 text-base md:text-lg">
                                        <div className="flex-shrink-0 text-lg font-black bg-chefini-yellow text-black border-2 border-black w-8 h-8 flex items-center justify-center">
                                            {index + 1}
                                        </div>
                                        <p className="flex-1 pt-0.5 leading-relaxed selectable">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        {/* Tip & Macros */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Tip */}
                            <div className="lg:col-span-2 p-4 bg-yellow-50 border-4 border-chefini-yellow shadow-brutal-sm">
                                <h3 className="text-xl font-black text-chefini-yellow mb-2 flex items-center gap-2">
                                    <Sparkles size={24} /> Chefini's Magic Tip
                                </h3>
                                <p className="text-base italic selectable">{recipe.tip}</p>
                            </div>
                            {/* Macros */}
                            <div className="lg:col-span-1 border-4 border-black p-4 bg-gray-100">
                                <h3 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-1">
                                    📊 Macros (Per Serving)
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-center">
                                    <div className="text-sm font-bold bg-white p-2 border border-black">
                                        <p className="text-2xl font-black text-red-600">{recipe.macros.protein}g</p>
                                        <p>Protein</p>
                                    </div>
                                    <div className="text-sm font-bold bg-white p-2 border border-black">
                                        <p className="text-2xl font-black text-blue-600">{recipe.macros.carbs}g</p>
                                        <p>Carbs</p>
                                    </div>
                                    <div className="text-sm font-bold bg-white p-2 border border-black">
                                        <p className="text-2xl font-black text-green-600">{recipe.macros.fats}g</p>
                                        <p>Fats</p>
                                    </div>
                                    <div className="text-sm font-bold bg-white p-2 border border-black">
                                        <p className="text-2xl font-black text-orange-600">{recipe.macros.calories}</p>
                                        <p>Calories</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 3. Cook Mode Overlay */}
            <CookMode
                recipe={recipe}
                isOpen={cookModeOpen}
                onClose={() => setCookModeOpen(false)}
            />
        </>
    );
}