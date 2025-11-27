'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Utensils, Eye, Flame, Clock, BookmarkPlus, ChefHat, MapPin, X, CheckCircle, AlertCircle, 
  Info, Download, Heart, ShoppingCart, Volume2, Sparkles, Globe, Trash2, ListPlus, Share2, 
  Check, Crown, Image as ImageIcon, MoreHorizontal, ChevronUp, ChevronDown 
} from 'lucide-react';

// ==========================================
// 1. HOOKS & UTILITIES (Inlined to fix imports)
// ==========================================

// --- useToast Hook ---
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

// --- Toast Component ---
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
    success: CheckCircle,
    error: AlertCircle,
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

// --- Script Loader for PDF/Image generation ---
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

function escapeHtml(input: string) {
  return String(input)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
}

// ==========================================
// 2. RECIPE MODAL COMPONENT
// ==========================================

interface RecipeModalProps {
  recipe: StaticRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToCookbook?: (recipe: any) => void;
  onAddToShoppingList?: (recipe: any) => void;
  onShare?: (recipe: any) => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  isSaved?: boolean;
  isOwner?: boolean;
  isPublic?: boolean;
  onTogglePublic?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

function RecipeModal({ 
    recipe, 
    isOpen, 
    onClose, 
    onSaveToCookbook, 
    onAddToShoppingList,
    onShare,
    showToast, 
    isSaved = false,
    isOwner = false,
    isPublic = false,
    onTogglePublic,
    onDelete,
    showActions = true
}: RecipeModalProps) {
  const [isReading, setIsReading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!isOpen || !recipe) return null;

  // ------------------------------------
  // 🔊 SPEAK INSTRUCTIONS
  // ------------------------------------
  const speakInstructions = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!isReading) {
        const text = recipe.instructions.map((step, i) => `Step ${i + 1}. ${step}`).join('. ');
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
    setDownloading(true);
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

        // *** EXACT HTML TEMPLATE ***
        tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; background: white; width: 800px;">
          <div style="background: #FFC72C; padding: 40px; text-align: center; border: 4px solid #000; border-bottom: none;">
            <div style="font-size: 48px; font-weight: 900; color: #000;">CHEFINI</div>
            <div style="font-size: 14px; color: #000; font-weight: bold; margin-top: 8px;">Turn Leftovers into Magic</div>
          </div>

          <div style="background: white; padding: 30px; text-align: center; border-left:4px solid #000; border-right:4px solid #000;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px dashed #ddd;">
                <div style="width: 40px; height: 40px; background: #000; border: 2px solid #FFC72C; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                        <line x1="6" y1="17" x2="18" y2="17"/>
                    </svg>
                </div>
                <div style="text-align: left;">
                    <div style="font-size: 18px; font-weight: 900; color: #000; line-height: 1;">Chefini <span style="background: #000; color: #FFC72C; padding: 0 4px; font-size: 12px;">GOLD</span></div>
                    <div style="font-size: 10px; font-weight: bold; color: #666; margin-top: 2px;">Premium Collection</div>
                </div>
            </div>
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
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px dashed #ddd;">
                <div style="width: 40px; height: 40px; background: #000; border: 2px solid #FFC72C; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                        <line x1="6" y1="17" x2="18" y2="17"/>
                    </svg>
                </div>
                <div style="text-align: left;">
                    <div style="font-size: 18px; font-weight: 900; color: #000; line-height: 1;">Chefini <span style="background: #000; color: #FFC72C; padding: 0 4px; font-size: 12px;">GOLD</span></div>
                    <div style="font-size: 10px; font-weight: bold; color: #666; margin-top: 2px;">Premium Collection</div>
                </div>
            </div>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 overflow-hidden">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>

      {/* Modal container */}
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
                    onClick={() => !isSaved && onSaveToCookbook(recipe)}
                    disabled={isSaved}
                    className={`px-4 py-2 font-bold border-2 border-black flex items-center gap-2 transition-all ${
                        isSaved 
                        ? 'bg-green-200 text-green-900 cursor-default' 
                        : 'bg-green-400 text-black hover:bg-green-500'
                    }`}
                  >
                    {isSaved ? <Check size={18} /> : <BookmarkPlus size={18} />}
                    {isSaved ? 'Saved' : 'Save to Cookbook'}
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
                        onClick={() => !isSaved && onSaveToCookbook(recipe)}
                        disabled={isSaved}
                        className={`p-2 font-bold border-2 border-black flex items-center justify-center gap-2 text-sm col-span-2 ${
                            isSaved 
                            ? 'bg-green-100 text-green-900 cursor-default' 
                            : 'bg-green-100 text-black'
                        }`}
                      >
                        {isSaved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                        {isSaved ? 'Saved' : 'Save to Cookbook'}
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

          {/* Branding Block Inside View Recipe */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-dashed border-gray-300">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-black text-chefini-yellow border-2 border-chefini-yellow flex items-center justify-center rounded-full shadow-sm">
                 <ChefHat size={20} className="md:w-6 md:h-6" />
             </div>
             <div>
                <p className="font-black text-base md:text-lg leading-none">Chefini <span className="text-chefini-yellow bg-black px-1 text-xs md:text-sm">GOLD</span></p>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold">Premium Collection</p>
             </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-black mb-4 flex items-center gap-2">
              <ShoppingCart size={24} /> INGREDIENTS
            </h3>
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
      </div>
    </div>
  );
}

// ==========================================
// 3. RECIPE DATA
// ==========================================

export interface StaticRecipe {
  _id: string;
  title: string;
  time: string;
  state: string;
  ingredients: Array<{ item: string; missing?: boolean }>;
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  tip: string;
  createdBy?: {
    name: string;
    image?: string;
    avatar?: string;
  };
}

const readyRecipes: StaticRecipe[] = [
  // --- WEST BENGAL (REQUESTED UPDATES) ---
  {
    _id: 'wb-1',
    title: 'Shorshe Ilish',
    state: 'West Bengal',
    time: '40 min',
    ingredients: [{ item: 'Hilsa Fish' }, { item: 'Mustard Paste' }, { item: 'Green Chilies' }, { item: 'Turmeric' }, { item: 'Mustard Oil' }],
    instructions: ['Marinate fish with turmeric and salt.', 'Make a thick paste of mustard seeds and green chilies.', 'Steam or simmer the fish in the mustard gravy.', 'Finish with a generous drizzle of raw mustard oil.'],
    macros: { calories: 320, protein: 22, carbs: 5, fats: 24 },
    tip: 'The pungency of raw mustard oil and green chilies is the signature of this dish.',
  },
  {
    _id: 'wb-2',
    title: 'Aloo Posto',
    state: 'West Bengal',
    time: '25 min',
    ingredients: [{ item: 'Potatoes (cubed)' }, { item: 'Poppy Seeds (Posto)' }, { item: 'Green Chilies' }, { item: 'Mustard Oil' }, { item: 'Kalonji' }],
    instructions: ['Grind poppy seeds into a smooth paste.', 'Sauté potatoes with Kalonji.', 'Add the paste and little water.', 'Cook until dry and coat the potatoes.'],
    macros: { calories: 240, protein: 6, carbs: 35, fats: 12 },
    tip: 'The poppy seed paste induces a slight drowsiness (Lyadh), synonymous with a Bengali Sunday lunch.',
  },
  {
    _id: 'wb-3',
    title: 'Shukto',
    state: 'West Bengal',
    time: '35 min',
    ingredients: [{ item: 'Bitter Gourd' }, { item: 'Raw Banana' }, { item: 'Sweet Potato' }, { item: 'Milk' }, { item: 'Panch Phoron' }],
    instructions: ['Fry bitter gourd slices separately.', 'Sauté mixed vegetables (plantain, potato, radish).', 'Simmer in a light gravy of milk and poppy seeds.', 'Finish with Ghee.'],
    macros: { calories: 180, protein: 5, carbs: 25, fats: 8 },
    tip: 'Always start a traditional Bengali meal with Shukto to cleanse the palate.',
  },

  // --- ANDAMAN & NICOBAR ISLANDS ---
  {
    _id: 'an-1',
    title: 'Coconut Prawn Curry',
    state: 'Andaman & Nicobar',
    time: '30 min',
    ingredients: [{ item: 'Prawns' }, { item: 'Coconut Milk' }, { item: 'Spices' }, { item: 'Mustard Seeds' }, { item: 'Curry Leaves' }],
    instructions: ['Marinate prawns in spices.', 'Sauté with mustard seeds and curry leaves.', 'Simmer in coconut milk until cooked.'],
    macros: { calories: 280, protein: 18, carbs: 8, fats: 15 },
    tip: 'Use fresh coconut milk for the best creamy texture.',
  },
  {
    _id: 'an-2',
    title: 'Grilled Fish',
    state: 'Andaman & Nicobar',
    time: '25 min',
    ingredients: [{ item: 'Fish Fillet' }, { item: 'Lemon Juice' }, { item: 'Black Pepper' }, { item: 'Butter' }, { item: 'Garlic' }],
    instructions: ['Marinate fish with lemon, pepper, and salt.', 'Grill with butter and garlic.', 'Serve with steamed veggies.'],
    macros: { calories: 220, protein: 22, carbs: 2, fats: 12 },
    tip: 'Don’t overcook the fish; keep it juicy and tender.',
  },
  {
    _id: 'an-3',
    title: 'Andaman Chilli Curry',
    state: 'Andaman & Nicobar',
    time: '35 min',
    ingredients: [{ item: 'Fish/Prawns' }, { item: 'Red Chilies' }, { item: 'Onion' }, { item: 'Tomato' }, { item: 'Garlic' }],
    instructions: ['Make a paste of red chilies and garlic.', 'Sauté onions and tomatoes.', 'Add the spicy paste and seafood.', 'Simmer until oil separates.'],
    macros: { calories: 250, protein: 20, carbs: 10, fats: 14 },
    tip: 'This dish is known for its fiery heat, typical of the islands.',
  },

  // --- ANDHRA PRADESH ---
  {
    _id: 'ap-1',
    title: 'Pesarattu',
    state: 'Andhra Pradesh',
    time: '20 min',
    ingredients: [{ item: 'Green Moong Dal' }, { item: 'Ginger' }, { item: 'Green Chili' }, { item: 'Rice Flour' }, { item: 'Onions' }],
    instructions: ['Soak moong dal overnight.', 'Grind with ginger and chili.', 'Spread like a dosa on a tawa.', 'Top with onions.'],
    macros: { calories: 180, protein: 10, carbs: 28, fats: 5 },
    tip: 'Serve with ginger chutney. Unlike Dosa, this batter does not need fermentation.',
  },
  {
    _id: 'ap-2',
    title: 'Tomato Pappu',
    state: 'Andhra Pradesh',
    time: '30 min',
    ingredients: [{ item: 'Toor Dal' }, { item: 'Tomatoes' }, { item: 'Green Chilies' }, { item: 'Garlic' }, { item: 'Tamarind' }],
    instructions: ['Pressure cook dal with tomatoes and chilies.', 'Mash well.', 'Add tamarind juice and simmer.', 'Temper with garlic and mustard seeds.'],
    macros: { calories: 190, protein: 10, carbs: 28, fats: 6 },
    tip: 'The garlic tempering should be slightly browned for the authentic flavor.',
  },
  {
    _id: 'ap-3',
    title: 'Gutti Vankaya (Stuffed Brinjal)',
    state: 'Andhra Pradesh',
    time: '40 min',
    ingredients: [{ item: 'Small Brinjals' }, { item: 'Peanuts' }, { item: 'Sesame Seeds' }, { item: 'Coconut' }, { item: 'Tamarind' }],
    instructions: ['Make a stuffing paste with peanuts, sesame, and spices.', 'Stuff slit brinjals.', 'Cook in oil, then add remaining paste and water to make gravy.'],
    macros: { calories: 260, protein: 6, carbs: 18, fats: 18 },
    tip: 'Choose purple, small, tender brinjals without seeds for the best taste.',
  },

  // --- ARUNACHAL PRADESH ---
  {
    _id: 'arp-1',
    title: 'Thukpa (Arunachal Style)',
    state: 'Arunachal Pradesh',
    time: '25 min',
    ingredients: [{ item: 'Noodles' }, { item: 'Mixed Veggies' }, { item: 'Ginger-Garlic' }, { item: 'Soy Sauce' }, { item: 'Chicken/Veg Broth' }],
    instructions: ['Sauté ginger-garlic and veggies.', 'Pour in broth and bring to boil.', 'Add noodles and soy sauce.', 'Simmer until noodles are cooked.'],
    macros: { calories: 280, protein: 8, carbs: 45, fats: 6 },
    tip: 'A hearty noodle soup perfect for cold weather.',
  },
  {
    _id: 'arp-2',
    title: 'Bamboo Shoot Fry',
    state: 'Arunachal Pradesh',
    time: '20 min',
    ingredients: [{ item: 'Bamboo Shoot (fermented)' }, { item: 'Red Chilies' }, { item: 'Garlic' }, { item: 'Mustard Oil' }],
    instructions: ['Heat mustard oil.', 'Add crushed garlic and red chilies.', 'Stir fry bamboo shoots on high heat.', 'Season with salt.'],
    macros: { calories: 120, protein: 3, carbs: 10, fats: 8 },
    tip: 'The distinct aroma comes from the fermented bamboo shoots.',
  },
  {
    _id: 'arp-3',
    title: 'Pika Pila',
    state: 'Arunachal Pradesh',
    time: '15 min',
    ingredients: [{ item: 'Pickle (Pika)' }, { item: 'Bamboo Shoot' }, { item: 'Pork fat or Oil' }, { item: 'King Chili' }],
    instructions: ['Mix ingredients to make a chutney-like side dish.', 'Traditionally uses pork fat, can sub with oil.'],
    macros: { calories: 200, protein: 2, carbs: 5, fats: 20 },
    tip: 'A famous pickle from the Apatani tribe.',
  },

  // --- ASSAM ---
  {
    _id: 'as-1',
    title: 'Masor Tenga (Sour Fish Curry)',
    state: 'Assam',
    time: '30 min',
    ingredients: [{ item: 'Fish' }, { item: 'Tomatoes' }, { item: 'Lemon Juice' }, { item: 'Mustard Seeds' }, { item: 'Turmeric' }],
    instructions: ['Fry fish lightly.', 'Sauté mustard seeds and tomatoes until soft.', 'Add water and bring to boil.', 'Add fish and finish with lemon juice.'],
    macros: { calories: 220, protein: 20, carbs: 8, fats: 10 },
    tip: 'The sourness (Tenga) is the soul of this dish, traditionally from Ou Tenga (Elephant Apple) or tomatoes.',
  },
  {
    _id: 'as-2',
    title: 'Aloo Pitika',
    state: 'Assam',
    time: '15 min',
    ingredients: [{ item: 'Boiled Potatoes' }, { item: 'Raw Onions' }, { item: 'Green Chilies' }, { item: 'Mustard Oil' }, { item: 'Coriander' }],
    instructions: ['Mash boiled potatoes.', 'Mix with chopped onions, chilies, and raw mustard oil.', 'Garnish with coriander.'],
    macros: { calories: 180, protein: 3, carbs: 30, fats: 5 },
    tip: 'Assamese comfort food similar to mashed potatoes but with a mustard oil kick.',
  },
  {
    _id: 'as-3',
    title: 'Khar (Papaya)',
    state: 'Assam',
    time: '25 min',
    ingredients: [{ item: 'Raw Papaya' }, { item: 'Mustard Oil' }, { item: 'Panch Phoron' }, { item: 'Soda (Bicarbonate)' }],
    instructions: ['Fry panch phoron in oil.', 'Add papaya chunks and soda.', 'Cook until soft and mushy.', 'Drizzle raw mustard oil.'],
    macros: { calories: 140, protein: 2, carbs: 20, fats: 6 },
    tip: 'Traditionally uses Kol Khar (banana ash water), but soda is a quick substitute.',
  },

  // --- BIHAR ---
  {
    _id: 'br-1',
    title: 'Litti Chokha',
    state: 'Bihar',
    time: '45 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Sattu' }, { item: 'Brinjal' }, { item: 'Tomato' }, { item: 'Ghee' }],
    instructions: ['Make dough balls stuffed with spiced sattu.', 'Roast brinjal and tomato for chokha.', 'Mash chokha with spices.', 'Dip litti in ghee and serve.'],
    macros: { calories: 450, protein: 15, carbs: 65, fats: 18 },
    tip: 'Roasting the litti over charcoal gives the best flavor, but an oven works too.',
  },
  {
    _id: 'br-2',
    title: 'Sattu Paratha',
    state: 'Bihar',
    time: '20 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Sattu (Roasted Gram Flour)' }, { item: 'Ajwain' }, { item: 'Pickle Masala' }, { item: 'Onion' }],
    instructions: ['Mix sattu with spices, onion, and pickle oil.', 'Stuff into dough balls.', 'Roll and cook on tawa with oil/ghee.'],
    macros: { calories: 280, protein: 10, carbs: 40, fats: 10 },
    tip: 'The pickle masala adds a tangy punch to the stuffing.',
  },
  {
    _id: 'br-3',
    title: 'Dal Pitha',
    state: 'Bihar',
    time: '30 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Chana Dal (soaked)' }, { item: 'Garlic' }, { item: 'Green Chilies' }, { item: 'Cumin' }],
    instructions: ['Make a dough with rice flour.', 'Grind soaked dal with spices for stuffing.', 'Stuff dough dumplings and steam.', 'Serve with chutney.'],
    macros: { calories: 220, protein: 8, carbs: 45, fats: 2 },
    tip: 'A healthy steamed dumpling, basically the Bihari version of Momos.',
  },

  // --- CHANDIGARH ---
  {
    _id: 'ch-1',
    title: 'Amritsari Kulcha',
    state: 'Chandigarh',
    time: '35 min',
    ingredients: [{ item: 'Maida' }, { item: 'Potatoes' }, { item: 'Spices' }, { item: 'Butter' }, { item: 'Yogurt' }],
    instructions: ['Make dough with yogurt.', 'Stuff with spiced potatoes.', 'Bake in tandoor or on tawa.', 'Smear with butter.'],
    macros: { calories: 350, protein: 8, carbs: 50, fats: 12 },
    tip: 'Serve hot with spicy chole.',
  },
  {
    _id: 'ch-2',
    title: 'Dahi Bhalla',
    state: 'Chandigarh',
    time: '30 min',
    ingredients: [{ item: 'Urad Dal' }, { item: 'Yogurt' }, { item: 'Tamarind Chutney' }, { item: 'Spices' }, { item: 'Oil' }],
    instructions: ['Soak and grind dal.', 'Fry vadas.', 'Soak in water, then squeeze.', 'Top with yogurt and chutneys.'],
    macros: { calories: 200, protein: 6, carbs: 25, fats: 8 },
    tip: 'Soaking the fried vadas in water makes them soft.',
  },
  {
    _id: 'ch-3',
    title: 'Paneer Tikka',
    state: 'Chandigarh',
    time: '40 min',
    ingredients: [{ item: 'Paneer' }, { item: 'Yogurt' }, { item: 'Tandoori Masala' }, { item: 'Capsicum' }, { item: 'Onion' }],
    instructions: ['Marinate paneer cubes and veggies in spiced yogurt.', 'Skewer them.', 'Grill or bake until charred.', 'Sprinkle chaat masala.'],
    macros: { calories: 320, protein: 18, carbs: 12, fats: 22 },
    tip: 'Hang the yogurt (curd) to remove excess water for a thick marinade.',
  },

  // --- CHHATTISGARH ---
  {
    _id: 'cg-1',
    title: 'Chila (Rice Pancakes)',
    state: 'Chhattisgarh',
    time: '15 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Water' }, { item: 'Salt' }, { item: 'Coriander Leaves' }, { item: 'Oil' }],
    instructions: ['Make a batter with rice flour and water.', 'Pour on hot tawa like a dosa.', 'Cook covered until crisp.', 'Serve with tomato chutney.'],
    macros: { calories: 180, protein: 3, carbs: 35, fats: 4 },
    tip: 'Simple and light breakfast staple of Chhattisgarh.',
  },
  {
    _id: 'cg-2',
    title: 'Faraa',
    state: 'Chhattisgarh',
    time: '30 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Leftover Rice' }, { item: 'Sesame Seeds' }, { item: 'Green Chilies' }, { item: 'Curry Leaves' }],
    instructions: ['Knead rice flour and cooked rice into dough.', 'Shape into fingers and steam.', 'Temper with sesame, chilies, and curry leaves.'],
    macros: { calories: 240, protein: 4, carbs: 50, fats: 5 },
    tip: 'A great way to use leftover rice.',
  },
  {
    _id: 'cg-3',
    title: 'Dubki Kadhi',
    state: 'Chhattisgarh',
    time: '25 min',
    ingredients: [{ item: 'Urad Dal (soaked)' }, { item: 'Curd' }, { item: 'Besan' }, { item: 'Mustard Seeds' }, { item: 'Curry Leaves' }],
    instructions: ['Grind urad dal and drop small dumplings into boiling kadhi.', 'The dumplings cook in the gravy itself ("dubki").', 'Temper with mustard seeds.'],
    macros: { calories: 200, protein: 10, carbs: 25, fats: 6 },
    tip: 'No frying needed for the dumplings; they are boiled directly in the curry.',
  },

  // --- DADRA & NAGAR HAVELI AND DAMAN & DIU ---
  {
    _id: 'dn-1',
    title: 'Ubadiyu (Simplified)',
    state: 'Dadra & Nagar Haveli',
    time: '45 min',
    ingredients: [{ item: 'Mixed Vegetables' }, { item: 'Beans' }, { item: 'Yams' }, { item: 'Herbs' }, { item: 'Earthen Pot' }],
    instructions: ['Mix veggies with herbs.', 'Place in pot.', 'Cook slowly over fire (or oven).'],
    macros: { calories: 250, protein: 8, carbs: 40, fats: 5 },
    tip: 'Traditionally cooked in an earthen pot underground.',
  },
  {
    _id: 'dn-2',
    title: 'Sweet Corn Soup',
    state: 'Daman & Diu',
    time: '20 min',
    ingredients: [{ item: 'Sweet Corn' }, { item: 'Vegetable Stock' }, { item: 'Cornflour' }, { item: 'Butter' }, { item: 'Pepper' }],
    instructions: ['Boil corn in stock.', 'Thicken with cornflour.', 'Add butter and pepper.'],
    macros: { calories: 150, protein: 3, carbs: 25, fats: 5 },
    tip: 'Use fresh sweet corn for better taste.',
  },
  {
    _id: 'dn-3',
    title: 'Chicken Bullet',
    state: 'Daman & Diu',
    time: '30 min',
    ingredients: [{ item: 'Minced Chicken' }, { item: 'Ginger Garlic' }, { item: 'Green Chili' }, { item: 'Breadcrumbs' }, { item: 'Oil' }],
    instructions: ['Mix minced chicken with spices and herbs.', 'Shape into bullet-shaped rolls.', 'Coat with breadcrumbs.', 'Deep fry until golden.'],
    macros: { calories: 300, protein: 20, carbs: 15, fats: 18 },
    tip: 'A famous spicy appetizer from Daman restaurants.',
  },

  // --- DELHI ---
  {
    _id: 'dl-1',
    title: 'Butter Chicken (Home Style)',
    state: 'Delhi',
    time: '40 min',
    ingredients: [{ item: 'Chicken' }, { item: 'Butter' }, { item: 'Cream' }, { item: 'Tomato Puree' }, { item: 'Kasuri Methi' }],
    instructions: ['Marinate and fry chicken.', 'Make gravy with butter and tomatoes.', 'Simmer chicken in gravy.', 'Add cream and kasuri methi.'],
    macros: { calories: 400, protein: 25, carbs: 10, fats: 28 },
    tip: 'The creamy tomato gravy is the highlight.',
  },
  {
    _id: 'dl-2',
    title: 'Aloo Tikki Chaat',
    state: 'Delhi',
    time: '25 min',
    ingredients: [{ item: 'Boiled Potatoes' }, { item: 'Peas' }, { item: 'Yogurt' }, { item: 'Chutneys' }, { item: 'Spices' }],
    instructions: ['Mash potatoes and peas, shape into patties.', 'Fry until crisp.', 'Top with yogurt, chutneys, and spices.'],
    macros: { calories: 300, protein: 5, carbs: 45, fats: 10 },
    tip: 'Fry on low heat for extra crispiness.',
  },
  {
    _id: 'dl-3',
    title: 'Chole Bhature (Simplified)',
    state: 'Delhi',
    time: '50 min',
    ingredients: [{ item: 'Chickpeas' }, { item: 'Maida' }, { item: 'Yogurt' }, { item: 'Onions' }, { item: 'Spices' }],
    instructions: ['Pressure cook chickpeas with spices.', 'Make dough for bhature.', 'Fry bhature.', 'Serve hot.'],
    macros: { calories: 500, protein: 15, carbs: 60, fats: 20 },
    tip: 'Use tea bags while boiling chickpeas for dark color.',
  },

  // --- GOA ---
  {
    _id: 'ga-1',
    title: 'Goan Dal (Varan)',
    state: 'Goa',
    time: '25 min',
    ingredients: [{ item: 'Toor Dal' }, { item: 'Coconut (grated)' }, { item: 'Green Chili' }, { item: 'Turmeric' }, { item: 'Mustard Seeds' }],
    instructions: ['Boil dal.', 'Add grated coconut, turmeric, and salt.', 'Simmer gently.', 'Temper with mustard seeds and curry leaves.'],
    macros: { calories: 180, protein: 9, carbs: 22, fats: 7 },
    tip: 'Simple and comforting, the coconut adds a subtle sweetness.',
  },
  {
    _id: 'ga-2',
    title: 'Mushroom Xacuti',
    state: 'Goa',
    time: '45 min',
    ingredients: [{ item: 'Mushrooms' }, { item: 'Roasted Coconut' }, { item: 'Whole Spices' }, { item: 'Onions' }, { item: 'Tamarind' }],
    instructions: ['Roast coconut and spices until dark brown.', 'Grind to a paste.', 'Cook mushrooms in this gravy.', 'Balance with tamarind.'],
    macros: { calories: 220, protein: 8, carbs: 15, fats: 15 },
    tip: 'The key is roasting the coconut until it is dark brown but not burnt.',
  },
  {
    _id: 'ga-3',
    title: 'Sol Kadhi',
    state: 'Goa',
    time: '10 min',
    ingredients: [{ item: 'Kokum' }, { item: 'Coconut Milk' }, { item: 'Garlic' }, { item: 'Green Chili' }, { item: 'Coriander' }],
    instructions: ['Soak kokum in warm water to extract juice.', 'Mix with fresh coconut milk.', 'Add crushed garlic and chili.', 'Chill before serving.'],
    macros: { calories: 120, protein: 2, carbs: 10, fats: 8 },
    tip: 'A digestive drink that pairs perfectly with rice and fish fry.',
  },

  // --- GUJARAT ---
  {
    _id: 'gj-1',
    title: 'Methi Thepla',
    state: 'Gujarat',
    time: '20 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Fenugreek Leaves (Methi)' }, { item: 'Curd' }, { item: 'Sesame Seeds' }, { item: 'Turmeric' }],
    instructions: ['Knead a soft dough with all ingredients.', 'Roll into thin discs.', 'Cook on a tawa with oil until brown spots appear.'],
    macros: { calories: 180, protein: 5, carbs: 28, fats: 6 },
    tip: 'Using curd in the dough keeps the Theplas soft for days.',
  },
  {
    _id: 'gj-2',
    title: 'Gujarati Kadhi',
    state: 'Gujarat',
    time: '20 min',
    ingredients: [{ item: 'Sour Curd' }, { item: 'Besan' }, { item: 'Jaggery' }, { item: 'Ginger-Chili Paste' }, { item: 'Cinnamon' }],
    instructions: ['Whisk curd, besan, and water.', 'Boil with jaggery and spices.', 'Temper with mustard seeds, cumin, and cinnamon.', 'Serve hot.'],
    macros: { calories: 150, protein: 6, carbs: 18, fats: 5 },
    tip: 'This Kadhi is thinner and sweeter than the Punjabi version.',
  },
  {
    _id: 'gj-3',
    title: 'Vaghareli Khichdi',
    state: 'Gujarat',
    time: '25 min',
    ingredients: [{ item: 'Rice' }, { item: 'Moong Dal' }, { item: 'Vegetables' }, { item: 'Whole Spices' }, { item: 'Ghee' }],
    instructions: ['Sauté whole spices and veggies in ghee.', 'Add washed rice and dal.', 'Pressure cook until soft.', 'Serve with Kadhi.'],
    macros: { calories: 300, protein: 10, carbs: 50, fats: 8 },
    tip: 'Using whole spices like cloves and cinnamon elevates this simple dish.',
  },

  // --- HARYANA ---
  {
    _id: 'hr-1',
    title: 'Bajra Khichdi',
    state: 'Haryana',
    time: '35 min',
    ingredients: [{ item: 'Bajra (Pearl Millet)' }, { item: 'Moong Dal' }, { item: 'Ghee' }, { item: 'Salt' }],
    instructions: ['Crush bajra slightly and soak.', 'Pressure cook bajra and dal with plenty of water.', 'Serve hot with a generous dollop of ghee.'],
    macros: { calories: 320, protein: 10, carbs: 60, fats: 10 },
    tip: 'A winter staple that warms the body.',
  },
  {
    _id: 'hr-2',
    title: 'Kadhi Pakora (Haryanvi)',
    state: 'Haryana',
    time: '30 min',
    ingredients: [{ item: 'Sour Lassi' }, { item: 'Besan' }, { item: 'Onion' }, { item: 'Fenugreek Seeds' }, { item: 'Red Chili' }],
    instructions: ['Mix lassi and besan.', 'Boil for a long time.', 'Add onion pakoras.', 'Temper with fenugreek seeds (methi dana).'],
    macros: { calories: 250, protein: 8, carbs: 20, fats: 15 },
    tip: 'The use of Methi dana in tempering distinguishes it from Punjabi Kadhi.',
  },
  {
    _id: 'hr-3',
    title: 'Besan Masala Roti',
    state: 'Haryana',
    time: '15 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Besan' }, { item: 'Onions' }, { item: 'Green Chilies' }, { item: 'Ghee' }],
    instructions: ['Mix flours, onions, and spices.', 'Knead dough.', 'Roll thick rotis and cook on tawa.', 'Smear with ghee.'],
    macros: { calories: 200, protein: 6, carbs: 35, fats: 8 },
    tip: 'Serve with fresh white butter (makhan).',
  },

  // --- HIMACHAL PRADESH ---
  {
    _id: 'hp-1',
    title: 'Chana Madra',
    state: 'Himachal Pradesh',
    time: '35 min',
    ingredients: [{ item: 'Chickpeas (Kabuli Chana)' }, { item: 'Yogurt' }, { item: 'Ghee' }, { item: 'Cardamom' }, { item: 'Cloves' }],
    instructions: ['Boil chickpeas.', 'Heat ghee and whole spices.', 'Add whisked yogurt and stir continuously.', 'Add chickpeas and simmer until thick.'],
    macros: { calories: 300, protein: 12, carbs: 30, fats: 15 },
    tip: 'Cook on low heat to prevent the yogurt from curdling.',
  },
  {
    _id: 'hp-2',
    title: 'Tudkiya Bhath',
    state: 'Himachal Pradesh',
    time: '30 min',
    ingredients: [{ item: 'Rice' }, { item: 'Lentils' }, { item: 'Yogurt' }, { item: 'Potatoes' }, { item: 'Spices' }],
    instructions: ['Soak rice and lentils.', 'Sauté veggies and spices in ghee.', 'Add yogurt, rice, lentils, and water.', 'Pressure cook like a pulao.'],
    macros: { calories: 350, protein: 10, carbs: 60, fats: 10 },
    tip: 'A spicy pulao unique to the Pahari region.',
  },
  {
    _id: 'hp-3',
    title: 'Babru',
    state: 'Himachal Pradesh',
    time: '30 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Black Gram Dal (soaked)' }, { item: 'Oil' }, { item: 'Baking Powder' }],
    instructions: ['Grind soaked dal into a paste.', 'Stuff into wheat flour dough.', 'Roll and deep fry like a puri.'],
    macros: { calories: 280, protein: 8, carbs: 40, fats: 15 },
    tip: 'The Himachali version of Kachori.',
  },

  // --- JAMMU & KASHMIR ---
  {
    _id: 'jk-1',
    title: 'Kashmiri Dum Aloo',
    state: 'Jammu & Kashmir',
    time: '40 min',
    ingredients: [{ item: 'Baby Potatoes' }, { item: 'Yogurt' }, { item: 'Fennel Powder' }, { item: 'Ginger Powder' }, { item: 'Mustard Oil' }],
    instructions: ['Fry potatoes until golden.', 'Make yogurt-based gravy with spices.', 'Simmer potatoes in gravy.'],
    macros: { calories: 320, protein: 6, carbs: 45, fats: 14 },
    tip: 'Fennel powder (saunf) is the key spice.',
  },
  {
    _id: 'jk-2',
    title: 'Haak Saag',
    state: 'Jammu & Kashmir',
    time: '20 min',
    ingredients: [{ item: 'Collard Greens (Haak)' }, { item: 'Mustard Oil' }, { item: 'Asafoetida' }, { item: 'Dried Chilies' }, { item: 'Salt' }],
    instructions: ['Heat mustard oil.', 'Add spices.', 'Add greens and water.', 'Cook until tender but green.'],
    macros: { calories: 100, protein: 4, carbs: 10, fats: 5 },
    tip: 'Keep it simple; let the greens shine.',
  },
  {
    _id: 'jk-3',
    title: 'Kahwa',
    state: 'Jammu & Kashmir',
    time: '15 min',
    ingredients: [{ item: 'Green Tea Leaves' }, { item: 'Saffron' }, { item: 'Cardamom' }, { item: 'Almonds' }, { item: 'Cinnamon' }],
    instructions: ['Boil water with spices.', 'Add tea leaves.', 'Strain and add saffron and nuts.'],
    macros: { calories: 50, protein: 1, carbs: 8, fats: 2 },
    tip: 'A warming tea for cold days.',
  },

  // --- JHARKHAND ---
  {
    _id: 'jh-1',
    title: 'Dhuska',
    state: 'Jharkhand',
    time: '30 min',
    ingredients: [{ item: 'Rice (soaked)' }, { item: 'Chana Dal (soaked)' }, { item: 'Green Chilies' }, { item: 'Cumin' }, { item: 'Oil' }],
    instructions: ['Grind rice and dal to a batter.', 'Add spices.', 'Deep fry ladlefuls of batter until golden puffy.', 'Serve with Aloo Chana.'],
    macros: { calories: 300, protein: 8, carbs: 45, fats: 12 },
    tip: 'A popular street food breakfast.',
  },
  {
    _id: 'jh-2',
    title: 'Chilka Roti',
    state: 'Jharkhand',
    time: '20 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Chana Dal' }, { item: 'Water' }, { item: 'Salt' }],
    instructions: ['Make a batter with rice flour and ground dal.', 'Spread thin on a tawa like a crepe.', 'Cook covered.'],
    macros: { calories: 180, protein: 4, carbs: 38, fats: 2 },
    tip: 'Served with mutton or spicy chickpea curry.',
  },
  {
    _id: 'jh-3',
    title: 'Bamboo Shoot Curry',
    state: 'Jharkhand',
    time: '25 min',
    ingredients: [{ item: 'Bamboo Shoots' }, { item: 'Mustard Oil' }, { item: 'Onion' }, { item: 'Garlic' }, { item: 'Spices' }],
    instructions: ['Boil bamboo shoots.', 'Sauté onion and garlic in mustard oil.', 'Add shoots and spices.', 'Simmer.'],
    macros: { calories: 150, protein: 3, carbs: 15, fats: 8 },
    tip: 'Use fresh bamboo shoots if available for the crunch.',
  },

  // --- KARNATAKA ---
  {
    _id: 'ka-1',
    title: 'Bisi Bele Bath',
    state: 'Karnataka',
    time: '40 min',
    ingredients: [{ item: 'Rice' }, { item: 'Toor Dal' }, { item: 'Tamarind' }, { item: 'Bisi Bele Bath Powder' }, { item: 'Mixed Veggies' }],
    instructions: ['Pressure cook rice, dal, and veggies.', 'Prepare tamarind water with spice powder.', 'Mix everything and simmer.', 'Temper with cashews and curry leaves.'],
    macros: { calories: 350, protein: 10, carbs: 55, fats: 10 },
    tip: 'Serve hot with boondi or potato chips for crunch.',
  },
  {
    _id: 'ka-2',
    title: 'Chitranna (Lemon Rice)',
    state: 'Karnataka',
    time: '15 min',
    ingredients: [{ item: 'Rice' }, { item: 'Lemon' }, { item: 'Peanuts' }, { item: 'Turmeric' }, { item: 'Green Chili' }],
    instructions: ['Temper mustard seeds, peanuts, dal, and chilies.', 'Add turmeric.', 'Mix with cooked rice and lemon juice.'],
    macros: { calories: 270, protein: 5, carbs: 45, fats: 8 },
    tip: 'Similar to TN Lemon Rice but often includes grated coconut or raw mango.',
  },
  {
    _id: 'ka-3',
    title: 'Kosambari',
    state: 'Karnataka',
    time: '10 min',
    ingredients: [{ item: 'Moong Dal (soaked)' }, { item: 'Cucumber' }, { item: 'Carrot' }, { item: 'Coconut' }, { item: 'Lemon' }],
    instructions: ['Soak moong dal for an hour.', 'Mix with chopped cucumber, grated carrot, and coconut.', 'Temper with mustard seeds and chili.'],
    macros: { calories: 120, protein: 7, carbs: 15, fats: 4 },
    tip: 'A refreshing raw salad full of protein. Perfect side dish.',
  },

  // --- KERALA ---
  {
    _id: 'kl-1',
    title: 'Vegetable Stew',
    state: 'Kerala',
    time: '30 min',
    ingredients: [{ item: 'Coconut Milk' }, { item: 'Potatoes' }, { item: 'Carrots' }, { item: 'Ginger' }, { item: 'Curry Leaves' }],
    instructions: ['Boil veggies with ginger and green chilies.', 'Add thin coconut milk and simmer.', 'Finish with thick coconut milk and raw coconut oil.', 'Do not boil after adding thick milk.'],
    macros: { calories: 280, protein: 4, carbs: 25, fats: 18 },
    tip: 'Never boil the stew after adding the thick coconut milk extract.',
  },
  {
    _id: 'kl-2',
    title: 'Puttu (Steam Cake)',
    state: 'Kerala',
    time: '20 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Grated Coconut' }, { item: 'Water' }, { item: 'Salt' }],
    instructions: ['Mix rice flour with water to a crumbly texture.', 'Layer flour and coconut in a Puttu maker.', 'Steam for 5-8 minutes.'],
    macros: { calories: 200, protein: 3, carbs: 40, fats: 4 },
    tip: 'The texture of the wet flour should hold shape when pressed but crumble easily.',
  },
  {
    _id: 'kl-3',
    title: 'Avial',
    state: 'Kerala',
    time: '25 min',
    ingredients: [{ item: 'Mixed Veggies' }, { item: 'Coconut' }, { item: 'Curd' }, { item: 'Cumin' }, { item: 'Coconut Oil' }],
    instructions: ['Boil veggies (drumstick, yam, carrot, beans).', 'Grind coconut and cumin.', 'Mix ground paste and curd with veggies.', 'Drizzle raw coconut oil.'],
    macros: { calories: 240, protein: 5, carbs: 28, fats: 12 },
    tip: 'Use local vegetables and drizzle raw coconut oil at the very end for aroma.',
  },

  // --- LADAKH ---
  {
    _id: 'la-1',
    title: 'Skyu',
    state: 'Ladakh',
    time: '40 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Vegetables' }, { item: 'Milk/Water' }, { item: 'Potatoes' }, { item: 'Turnips' }],
    instructions: ['Make pasta-like dough pieces.', 'Cook with veggies in a stew.', 'Add milk for richness.'],
    macros: { calories: 300, protein: 10, carbs: 50, fats: 5 },
    tip: 'A traditional pasta stew.',
  },
  {
    _id: 'la-2',
    title: 'Butter Tea',
    state: 'Ladakh',
    time: '10 min',
    ingredients: [{ item: 'Tea Leaves' }, { item: 'Butter' }, { item: 'Salt' }, { item: 'Milk' }],
    instructions: ['Boil tea.', 'Churn with butter, milk, and salt.', 'Serve hot.'],
    macros: { calories: 150, protein: 1, carbs: 2, fats: 15 },
    tip: 'Salty and buttery tea to keep warm.',
  },
  {
    _id: 'la-3',
    title: 'Chhurpi Cheese Curry',
    state: 'Ladakh',
    time: '25 min',
    ingredients: [{ item: 'Chhurpi (Yak Cheese)' }, { item: 'Onion' }, { item: 'Tomato' }, { item: 'Green Chili' }, { item: 'Turmeric' }],
    instructions: ['Soak dry chhurpi or use fresh soft chhurpi.', 'Sauté with onions, tomatoes, and chilies.', 'Cook into a thick spicy curry.'],
    macros: { calories: 280, protein: 15, carbs: 10, fats: 20 },
    tip: 'Chhurpi adds a unique tangy and smoky flavor to the dish.',
  },

  // --- LAKSHADWEEP ---
  {
    _id: 'ld-1',
    title: 'Mas Min (Tuna Salad)',
    state: 'Lakshadweep',
    time: '15 min',
    ingredients: [{ item: 'Tuna (dried)' }, { item: 'Coconut' }, { item: 'Onion' }, { item: 'Curry Leaves' }, { item: 'Spices' }],
    instructions: ['Shred dried tuna.', 'Mix with grated coconut and spices.', 'Sauté briefly.'],
    macros: { calories: 200, protein: 25, carbs: 5, fats: 10 },
    tip: 'A common side dish.',
  },
  {
    _id: 'ld-2',
    title: 'Kilanji',
    state: 'Lakshadweep',
    time: '25 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Coconut Milk' }, { item: 'Egg' }, { item: 'Sugar' }, { item: 'Banana' }],
    instructions: ['Make a thin batter with rice flour, coconut milk, and egg.', 'Pour thin crepes on a pan.', 'Serve with a sweet liquid of coconut milk and banana.'],
    macros: { calories: 240, protein: 4, carbs: 45, fats: 8 },
    tip: 'Paper-thin crepes, often served at weddings.',
  },
  {
    _id: 'ld-3',
    title: 'Mus Kavaab',
    state: 'Lakshadweep',
    time: '35 min',
    ingredients: [{ item: 'Tuna Fish' }, { item: 'Chili Powder' }, { item: 'Coriander Powder' }, { item: 'Tomato' }, { item: 'Curry Leaves' }],
    instructions: ['Marinate tuna chunks in spicy masala.', 'Cook in a thick gravy of tomato and spices.', 'Reduce until dry and coated.'],
    macros: { calories: 280, protein: 25, carbs: 5, fats: 15 },
    tip: 'A spicy dry fish curry that pairs well with rice.',
  },

  // --- MADHYA PRADESH ---
  {
    _id: 'mp-1',
    title: 'Indori Poha',
    state: 'Madhya Pradesh',
    time: '15 min',
    ingredients: [{ item: 'Poha' }, { item: 'Fennel Seeds (Saunf)' }, { item: 'Jeeravan Masala' }, { item: 'Sev' }, { item: 'Pomegranate' }],
    instructions: ['Steam soaked poha over boiling water.', 'Temper with fennel and mustard seeds.', 'Sprinkle Jeeravan masala.', 'Top with Sev and Pomegranate.'],
    macros: { calories: 280, protein: 5, carbs: 50, fats: 8 },
    tip: 'Steaming the poha instead of direct cooking makes it incredibly soft.',
  },
  {
    _id: 'mp-2',
    title: 'Bhutte Ka Kees',
    state: 'Madhya Pradesh',
    time: '20 min',
    ingredients: [{ item: 'Corn (grated)' }, { item: 'Milk' }, { item: 'Mustard Seeds' }, { item: 'Green Chili' }, { item: 'Coconut' }],
    instructions: ['Sauté grated corn in ghee with spices.', 'Add milk and simmer until thick.', 'Garnish with coconut and coriander.'],
    macros: { calories: 250, protein: 6, carbs: 40, fats: 10 },
    tip: 'A savory corn pudding unique to MP.',
  },
  {
    _id: 'mp-3',
    title: 'Dal Bafla (Simplified)',
    state: 'Madhya Pradesh',
    time: '45 min',
    ingredients: [{ item: 'Wheat Flour' }, { item: 'Semolina' }, { item: 'Ghee' }, { item: 'Toor Dal' }, { item: 'Turmeric' }],
    instructions: ['Make dough balls with flour and ghee.', 'Boil them in water first.', 'Bake or roast until golden.', 'Serve with spicy Dal.'],
    macros: { calories: 450, protein: 12, carbs: 65, fats: 18 },
    tip: 'Boiling before baking makes the Bafla softer than Rajasthani Baati.',
  },

  // --- MAHARASHTRA ---
  {
    _id: 'mh-1',
    title: 'Kanda Poha',
    state: 'Maharashtra',
    time: '15 min',
    ingredients: [{ item: 'Thick Poha' }, { item: 'Onions' }, { item: 'Mustard Seeds' }, { item: 'Peanuts' }, { item: 'Turmeric' }],
    instructions: ['Rinse poha and drain.', 'Sauté mustard seeds, peanuts, and onions.', 'Add turmeric and poha, mix gently.', 'Steam covered for 2 mins.'],
    macros: { calories: 260, protein: 5, carbs: 45, fats: 9 },
    tip: 'Do not soak poha in water; just rinse it in a colander to keep it fluffy.',
  },
  {
    _id: 'mh-2',
    title: 'Misal Pav (Simplified)',
    state: 'Maharashtra',
    time: '30 min',
    ingredients: [{ item: 'Sprouted Moth Beans' }, { item: 'Farsan' }, { item: 'Pav Buns' }, { item: 'Goda Masala' }, { item: 'Onions' }],
    instructions: ['Cook sprouts with turmeric and salt.', 'Prepare a spicy watery curry (kat) with goda masala.', 'Assemble: sprouts, curry, farsan, and chopped onions.', 'Serve with Pav.'],
    macros: { calories: 400, protein: 15, carbs: 60, fats: 15 },
    tip: 'The spice level defines a good Misal. Add a squeeze of lime to balance the heat.',
  },
  {
    _id: 'mh-3',
    title: 'Sabudana Khichdi',
    state: 'Maharashtra',
    time: '20 min',
    ingredients: [{ item: 'Sago (Sabudana)' }, { item: 'Roasted Peanuts (crushed)' }, { item: 'Green Chilies' }, { item: 'Ghee' }, { item: 'Potatoes' }],
    instructions: ['Soak sabudana overnight.', 'Sauté cumin, chilies, and boiled potatoes in ghee.', 'Add sabudana and crushed peanuts.', 'Cook until pearls turn translucent.'],
    macros: { calories: 380, protein: 6, carbs: 70, fats: 12 },
    tip: 'Drain the sabudana extremely well before cooking to prevent it from becoming a sticky lump.',
  },

  // --- MANIPUR ---
  {
    _id: 'mn-1',
    title: 'Eromba',
    state: 'Manipur',
    time: '20 min',
    ingredients: [{ item: 'Fermented Fish (Ngari)' }, { item: 'Boiled Veggies' }, { item: 'Ghost Pepper' }, { item: 'Potatoes' }],
    instructions: ['Steam Ngari.', 'Mash boiled potatoes and veggies.', 'Mix with Ngari and crushed chilies.', 'Garnish with coriander.'],
    macros: { calories: 180, protein: 8, carbs: 30, fats: 2 },
    tip: 'Very spicy and pungent. The soul of Manipuri cuisine.',
  },
  {
    _id: 'mn-2',
    title: 'Kangshoi',
    state: 'Manipur',
    time: '25 min',
    ingredients: [{ item: 'Seasonal Veggies' }, { item: 'Dried Fish' }, { item: 'Ginger' }, { item: 'Garlic' }, { item: 'Onion' }],
    instructions: ['Boil water.', 'Add veggies, dried fish, and sliced onions.', 'Simmer until tender.', 'It is a healthy stew.'],
    macros: { calories: 150, protein: 10, carbs: 20, fats: 2 },
    tip: 'Oil-free stew perfect for a light dinner.',
  },
  {
    _id: 'mn-3',
    title: 'Chak-Hao Kheer',
    state: 'Manipur',
    time: '40 min',
    ingredients: [{ item: 'Black Rice' }, { item: 'Milk' }, { item: 'Sugar' }, { item: 'Cardamom' }, { item: 'Nuts' }],
    instructions: ['Soak black rice.', 'Boil milk and reduce.', 'Add rice and cook until soft (it turns purple).', 'Add sugar and nuts.'],
    macros: { calories: 350, protein: 8, carbs: 60, fats: 10 },
    tip: 'Black rice is a superfood rich in antioxidants.',
  },

  // --- MEGHALAYA ---
  {
    _id: 'mg-1',
    title: 'Jadoh (Rice & Meat)',
    state: 'Meghalaya',
    time: '30 min',
    ingredients: [{ item: 'Short Grain Rice' }, { item: 'Pork/Chicken' }, { item: 'Ginger' }, { item: 'Black Pepper' }, { item: 'Onion' }],
    instructions: ['Sauté meat with onions and ginger.', 'Add washed rice and water.', 'Cook until rice absorbs the meat flavor.', 'Season with black pepper.'],
    macros: { calories: 400, protein: 15, carbs: 50, fats: 15 },
    tip: 'Use fatty meat for the authentic rich taste.',
  },
  {
    _id: 'mg-2',
    title: 'Doh Khleh',
    state: 'Meghalaya',
    time: '15 min',
    ingredients: [{ item: 'Boiled Pork/Chicken' }, { item: 'Onion' }, { item: 'Ginger' }, { item: 'Green Chili' }, { item: 'Salt' }],
    instructions: ['Finely chop boiled meat.', 'Mix with raw onion and ginger.', 'Simple salad served with rice.'],
    macros: { calories: 250, protein: 20, carbs: 5, fats: 15 },
    tip: 'A simple, protein-rich salad.',
  },
  {
    _id: 'mg-3',
    title: 'Nakham Bitchi',
    state: 'Meghalaya',
    time: '20 min',
    ingredients: [{ item: 'Dry Fish' }, { item: 'Vegetables' }, { item: 'Chili' }, { item: 'Soda' }],
    instructions: ['Boil dry fish with soda.', 'Add vegetables.', 'Simmer to make a soup.', 'Serve hot.'],
    macros: { calories: 100, protein: 10, carbs: 10, fats: 2 },
    tip: 'A palate cleanser soup served before meals.',
  },

  // --- MIZORAM ---
  {
    _id: 'mz-1',
    title: 'Bai',
    state: 'Mizoram',
    time: '25 min',
    ingredients: [{ item: 'Pork Sauce (Sa-um)' }, { item: 'Vegetables' }, { item: 'Bamboo Shoots' }, { item: 'Green Chilies' }],
    instructions: ['Boil mixed vegetables with bamboo shoots.', 'Add fermented pork sauce (or sub with baking soda/salt for veg version).', 'Simmer.'],
    macros: { calories: 150, protein: 5, carbs: 25, fats: 3 },
    tip: 'A non-spicy, healthy vegetable stew.',
  },
  {
    _id: 'mz-2',
    title: 'Vawksa Rep',
    state: 'Mizoram',
    time: '30 min',
    ingredients: [{ item: 'Smoked Pork' }, { item: 'Mustard Leaves' }, { item: 'Chilies' }, { item: 'Ginger' }],
    instructions: ['Cut smoked pork into cubes.', 'Stir fry with mustard leaves and chilies.', 'Add ginger.'],
    macros: { calories: 300, protein: 20, carbs: 5, fats: 22 },
    tip: 'The smoky flavor of the meat pairs well with bitter mustard greens.',
  },
  {
    _id: 'mz-3',
    title: 'Koat Pitha',
    state: 'Mizoram',
    time: '25 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Banana' }, { item: 'Jaggery' }, { item: 'Oil' }],
    instructions: ['Mash bananas and jaggery.', 'Mix with rice flour.', 'Deep fry fritters.'],
    macros: { calories: 220, protein: 2, carbs: 40, fats: 8 },
    tip: 'A sweet snack similar to unniyappam.',
  },

  // --- NAGALAND ---
  {
    _id: 'nl-1',
    title: 'Smoked Pork with Bamboo Shoot',
    state: 'Nagaland',
    time: '40 min',
    ingredients: [{ item: 'Smoked Pork' }, { item: 'Fermented Bamboo Shoot' }, { item: 'King Chili' }, { item: 'Ginger' }, { item: 'Garlic' }],
    instructions: ['Cook smoked pork with water.', 'Add bamboo shoots and king chili.', 'Simmer until tender and dry.'],
    macros: { calories: 350, protein: 25, carbs: 5, fats: 25 },
    tip: 'One of the most famous dishes of the North East. Spicy and smoky.',
  },
  {
    _id: 'nl-2',
    title: 'Hinkejvu',
    state: 'Nagaland',
    time: '20 min',
    ingredients: [{ item: 'Colocasia' }, { item: 'Cabbage' }, { item: 'Mustard Leaves' }, { item: 'Beans' }],
    instructions: ['Boil mix vegetables together.', 'Add a pinch of salt.', 'Mash slightly.', 'Serve as a side.'],
    macros: { calories: 120, protein: 4, carbs: 25, fats: 0 },
    tip: 'A purely boiled vegetable dish, very healthy.',
  },
  {
    _id: 'nl-3',
    title: 'Galho',
    state: 'Nagaland',
    time: '30 min',
    ingredients: [{ item: 'Rice' }, { item: 'Vegetables' }, { item: 'Smoked Meat (optional)' }, { item: 'Axone (Soybean)' }],
    instructions: ['Cook rice and veggies together like a khichdi.', 'Add Axone (fermented soybean) for flavor.', 'Simmer until mushy.'],
    macros: { calories: 300, protein: 10, carbs: 50, fats: 5 },
    tip: 'Naga version of Khichdi.',
  },

  // --- ODISHA ---
  {
    _id: 'od-1',
    title: 'Dalma',
    state: 'Odisha',
    time: '35 min',
    ingredients: [{ item: 'Toor Dal' }, { item: 'Pumpkin' }, { item: 'Raw Banana' }, { item: 'Brinjal' }, { item: 'Coconut' }],
    instructions: ['Boil dal with vegetables.', 'Temper with panch phoron and dry chili.', 'Garnish with grated coconut.'],
    macros: { calories: 220, protein: 10, carbs: 35, fats: 5 },
    tip: 'Roasted cumin-chili powder sprinkled on top is essential.',
  },
  {
    _id: 'od-2',
    title: 'Pakhala Bhata',
    state: 'Odisha',
    time: '10 min',
    ingredients: [{ item: 'Cooked Rice' }, { item: 'Water' }, { item: 'Curd' }, { item: 'Green Chili' }, { item: 'Lemon' }],
    instructions: ['Soak cooked rice in water overnight (or fresh).', 'Add curd, lemon, and salt.', 'Temper with mustard seeds and curry leaves.', 'Serve with fried veggies.'],
    macros: { calories: 200, protein: 4, carbs: 40, fats: 2 },
    tip: 'The ultimate summer cooler.',
  },
  {
    _id: 'od-3',
    title: 'Santula',
    state: 'Odisha',
    time: '20 min',
    ingredients: [{ item: 'Mixed Veggies' }, { item: 'Milk' }, { item: 'Panch Phoron' }, { item: 'Green Chili' }, { item: 'Garlic' }],
    instructions: ['Boil vegetables with salt.', 'Temper spices and garlic in little oil.', 'Add boiled veggies and a splash of milk.', 'Simmer.'],
    macros: { calories: 150, protein: 5, carbs: 25, fats: 4 },
    tip: 'Low spice, highly nutritious vegetable curry.',
  },

  // --- PUDUCHERRY ---
  {
    _id: 'py-1',
    title: 'Poulet Rouge',
    state: 'Puducherry',
    time: '40 min',
    ingredients: [{ item: 'Chicken' }, { item: 'Red Chilies' }, { item: 'Vinegar' }, { item: 'Onions' }, { item: 'Tomato' }],
    instructions: ['Marinate chicken in spicy red paste.', 'Cook with onions and tomatoes.', 'Simmer until tender.'],
    macros: { calories: 350, protein: 25, carbs: 10, fats: 20 },
    tip: 'A French-influenced red chicken curry.',
  },
  {
    _id: 'py-2',
    title: 'Soybean Vadai',
    state: 'Puducherry',
    time: '20 min',
    ingredients: [{ item: 'Soybean' }, { item: 'Chana Dal' }, { item: 'Onion' }, { item: 'Fennel' }, { item: 'Oil' }],
    instructions: ['Grind soaked soya and dal.', 'Mix with spices.', 'Deep fry patties.'],
    macros: { calories: 180, protein: 8, carbs: 20, fats: 8 },
    tip: 'A healthy twist on the classic vada.',
  },
  {
    _id: 'py-3',
    title: 'Prawn Creole',
    state: 'Puducherry',
    time: '35 min',
    ingredients: [{ item: 'Prawns' }, { item: 'Tomato Paste' }, { item: 'Onion' }, { item: 'Garlic' }, { item: 'Vinegar' }],
    instructions: ['Sauté onions and garlic.', 'Add tomato paste and vinegar.', 'Cook prawns in this tangy sauce.', 'Serve with baguette or rice.'],
    macros: { calories: 260, protein: 22, carbs: 12, fats: 10 },
    tip: 'The French influence shines through the use of vinegar and minimal spices.',
  },

  // --- PUNJAB ---
  {
    _id: 'punjab-1',
    title: 'Dal Makhani (Home Style)',
    state: 'Punjab',
    time: '40 min',
    ingredients: [{ item: 'Whole Black Urad Dal' }, { item: 'Kidney Beans (Rajma)' }, { item: 'Butter' }, { item: 'Cream' }, { item: 'Tomato Puree' }],
    instructions: ['Pressure cook soaked dal and rajma for 6 whistles.', 'Sauté ginger-garlic paste and tomato puree in butter.', 'Add the mashed dal and simmer on low heat for 20 mins.', 'Finish with fresh cream and kasuri methi.'],
    macros: { calories: 320, protein: 12, carbs: 35, fats: 18 },
    tip: 'The secret is slow cooking. Let it simmer on low heat to get that creamy texture.',
  },
  {
    _id: 'punjab-2',
    title: 'Paneer Bhurji',
    state: 'Punjab',
    time: '15 min',
    ingredients: [{ item: 'Paneer (crumbled)' }, { item: 'Onions' }, { item: 'Tomatoes' }, { item: 'Green Chilies' }, { item: 'Jeera' }],
    instructions: ['Sauté cumin and onions until golden.', 'Add tomatoes and spices.', 'Toss in crumbled paneer and mix well.', 'Garnish with coriander.'],
    macros: { calories: 280, protein: 18, carbs: 8, fats: 20 },
    tip: 'Do not overcook the paneer, or it will become chewy. Keep it soft and moist.',
  },
  {
    _id: 'punjab-3',
    title: 'Rajma Chawal',
    state: 'Punjab',
    time: '35 min',
    ingredients: [{ item: 'Red Kidney Beans' }, { item: 'Rice' }, { item: 'Onions' }, { item: 'Tomatoes' }, { item: 'Garam Masala' }],
    instructions: ['Soak and pressure cook Rajma.', 'Prepare a masala base with onions and tomatoes.', 'Simmer rajma in the masala until thick.', 'Serve hot over steamed rice.'],
    macros: { calories: 350, protein: 14, carbs: 55, fats: 8 },
    tip: 'Mash a few rajma beans into the gravy to thicken it naturally.',
  },

  // --- RAJASTHAN ---
  {
    _id: 'rj-1',
    title: 'Gatte Ki Sabzi',
    state: 'Rajasthan',
    time: '40 min',
    ingredients: [{ item: 'Besan (Gram Flour)' }, { item: 'Curd' }, { item: 'Spices' }, { item: 'Ajwain' }, { item: 'Oil' }],
    instructions: ['Make stiff dough with besan and spices.', 'Boil dumplings in water, then cut into discs.', 'Cook discs in a spicy yogurt gravy.'],
    macros: { calories: 280, protein: 12, carbs: 25, fats: 14 },
    tip: 'Whisk the yogurt continuously while adding it to the hot pan to prevent curdling.',
  },
  {
    _id: 'rj-2',
    title: 'Besan Chilla',
    state: 'Rajasthan',
    time: '15 min',
    ingredients: [{ item: 'Besan' }, { item: 'Onions' }, { item: 'Green Chilies' }, { item: 'Ajwain' }, { item: 'Coriander' }],
    instructions: ['Make a batter with besan and veggies.', 'Spread on a hot tawa like a crepe.', 'Cook with oil until golden.'],
    macros: { calories: 160, protein: 8, carbs: 18, fats: 6 },
    tip: 'Ajwain is crucial for digestion and flavor in besan dishes.',
  },
  {
    _id: 'rj-3',
    title: 'Aloo Pyaz Sabzi',
    state: 'Rajasthan',
    time: '25 min',
    ingredients: [{ item: 'Potatoes (fried)' }, { item: 'Small Onions' }, { item: 'Tomato' }, { item: 'Red Chili Powder' }, { item: 'Oil' }],
    instructions: ['Deep fry potato cubes and whole small onions.', 'Make a spicy tomato gravy.', 'Simmer fried veggies in the gravy.'],
    macros: { calories: 320, protein: 4, carbs: 30, fats: 20 },
    tip: 'This is a rich, spicy dish usually served with Tikkad or Roti.',
  },

  // --- SIKKIM ---
  {
    _id: 'sk-1',
    title: 'Momos',
    state: 'Sikkim',
    time: '40 min',
    ingredients: [{ item: 'Refined Flour' }, { item: 'Minced Meat/Veg' }, { item: 'Onion' }, { item: 'Ginger' }, { item: 'Soy Sauce' }],
    instructions: ['Make dough.', 'Mix filling with spices.', 'Shape dumplings.', 'Steam for 10-15 mins.', 'Serve with spicy chutney.'],
    macros: { calories: 250, protein: 10, carbs: 40, fats: 5 },
    tip: 'The dough should be rolled very thin for the best texture.',
  },
  {
    _id: 'sk-2',
    title: 'Thukpa (Sikkim Style)',
    state: 'Sikkim',
    time: '25 min',
    ingredients: [{ item: 'Noodles' }, { item: 'Vegetables' }, { item: 'Meat (optional)' }, { item: 'Garlic' }, { item: 'Chili' }],
    instructions: ['Prepare a flavorful broth.', 'Add veggies and meat.', 'Add noodles.', 'Garnish with spring onions.'],
    macros: { calories: 300, protein: 12, carbs: 50, fats: 8 },
    tip: 'A complete meal in a bowl.',
  },
  {
    _id: 'sk-3',
    title: 'Phagshapa',
    state: 'Sikkim',
    time: '35 min',
    ingredients: [{ item: 'Pork Strips' }, { item: 'Radish' }, { item: 'Dried Chilies' }, { item: 'Ginger' }],
    instructions: ['Stir fry pork with radishes.', 'Add dried chilies.', 'Stew until tender.', 'No oil is usually added (uses pork fat).'],
    macros: { calories: 350, protein: 20, carbs: 10, fats: 25 },
    tip: 'Radish cuts the richness of the pork.',
  },

  // --- TAMIL NADU ---
  {
    _id: 'tn-1',
    title: 'Curd Rice (Thayir Sadam)',
    state: 'Tamil Nadu',
    time: '10 min',
    ingredients: [{ item: 'Mushy Rice' }, { item: 'Yogurt' }, { item: 'Mustard Seeds' }, { item: 'Curry Leaves' }, { item: 'Pomegranate' }],
    instructions: ['Mash warm rice with yogurt.', 'Temper mustard seeds and curry leaves in oil.', 'Pour over rice.', 'Garnish with pomegranate seeds.'],
    macros: { calories: 220, protein: 6, carbs: 35, fats: 6 },
    tip: 'Add a splash of milk to the yogurt to prevent the dish from turning too sour later.',
  },
  {
    _id: 'tn-2',
    title: 'Lemon Rice',
    state: 'Tamil Nadu',
    time: '15 min',
    ingredients: [{ item: 'Cooked Rice' }, { item: 'Lemon Juice' }, { item: 'Turmeric' }, { item: 'Peanuts' }, { item: 'Chana Dal' }],
    instructions: ['Roast peanuts and chana dal in oil.', 'Add turmeric and curry leaves.', 'Toss in rice and salt.', 'Turn off heat and mix in lemon juice.'],
    macros: { calories: 280, protein: 5, carbs: 48, fats: 8 },
    tip: 'Never cook the lemon juice; always add it after turning off the flame to avoid bitterness.',
  },
  {
    _id: 'tn-3',
    title: 'Potato Poriyal',
    state: 'Tamil Nadu',
    time: '20 min',
    ingredients: [{ item: 'Potatoes (diced)' }, { item: 'Mustard Seeds' }, { item: 'Urad Dal' }, { item: 'Sambar Powder' }, { item: 'Curry Leaves' }],
    instructions: ['Temper mustard seeds and urad dal.', 'Add diced potatoes and roast on low flame.', 'Sprinkle sambar powder and salt.', 'Cook until crispy.'],
    macros: { calories: 180, protein: 4, carbs: 30, fats: 6 },
    tip: 'Roast on a low flame without a lid for the crispiest texture.',
  },

  // --- TELANGANA ---
  {
    _id: 'tg-1',
    title: 'Sarva Pindi',
    state: 'Telangana',
    time: '30 min',
    ingredients: [{ item: 'Rice Flour' }, { item: 'Chana Dal' }, { item: 'Peanuts' }, { item: 'Sesame' }, { item: 'Curry Leaves' }],
    instructions: ['Mix ingredients into a dough.', 'Flatten onto a pan like a thick pancake.', 'Make holes in it.', 'Cook with oil until crisp.'],
    macros: { calories: 280, protein: 6, carbs: 45, fats: 8 },
    tip: 'Making holes ensures it cooks evenly and becomes crispy.',
  },
  {
    _id: 'tg-2',
    title: 'Hyderabadi Khichdi',
    state: 'Telangana',
    time: '25 min',
    ingredients: [{ item: 'Basmati Rice' }, { item: 'Masoor Dal' }, { item: 'Whole Spices' }, { item: 'Ghee' }, { item: 'Onions' }],
    instructions: ['Sauté spices and onions in ghee.', 'Add washed rice and dal.', 'Cook until fluffy.', 'Serve with Til ka Khatta.'],
    macros: { calories: 320, protein: 10, carbs: 55, fats: 8 },
    tip: 'Unlike other khichdis, this one is dry and fluffy like a pulao.',
  },
  {
    _id: 'tg-3',
    title: 'Pachi Pulusu',
    state: 'Telangana',
    time: '10 min',
    ingredients: [{ item: 'Tamarind' }, { item: 'Onion' }, { item: 'Green Chili' }, { item: 'Jaggery' }, { item: 'Coriander' }],
    instructions: ['Extract raw tamarind juice.', 'Roast chilies on flame and mash.', 'Mix with juice, jaggery, and onions.', 'No cooking needed.'],
    macros: { calories: 80, protein: 1, carbs: 20, fats: 0 },
    tip: 'A raw rasam that is sweet, sour, and spicy.',
  },

  // --- TRIPURA ---
  {
    _id: 'tr-1',
    title: 'Kosoi Bwtwi',
    state: 'Tripura',
    time: '20 min',
    ingredients: [{ item: 'Beans' }, { item: 'Garlic' }, { item: 'Green Chili' }, { item: 'Berma (Fermented Fish)' }, { item: 'Salt' }],
    instructions: ['Boil beans with garlic and chilies.', 'Add Berma for flavor.', 'Mash slightly or serve as soup.'],
    macros: { calories: 100, protein: 5, carbs: 15, fats: 1 },
    tip: 'A healthy, oil-free bean stew.',
  },
  {
    _id: 'tr-2',
    title: 'Mui Borok',
    state: 'Tripura',
    time: '30 min',
    ingredients: [{ item: 'Fish' }, { item: 'Berma' }, { item: 'Vegetables' }, { item: 'Chili' }],
    instructions: ['Traditional Tripuri meal plate.', 'Steam or boil fish and veggies with Berma.', 'Very healthy and organic.'],
    macros: { calories: 250, protein: 20, carbs: 20, fats: 5 },
    tip: 'The defining ingredient is Berma.',
  },
  {
    _id: 'tr-3',
    title: 'Gudok',
    state: 'Tripura',
    time: '25 min',
    ingredients: [{ item: 'Vegetables' }, { item: 'Berma' }, { item: 'Bamboo Shoots' }, { item: 'Jackfruit Seeds' }],
    instructions: ['Mash boiled vegetables and bamboo shoots.', 'Mix with fermented fish.', 'Serve with rice.'],
    macros: { calories: 180, protein: 6, carbs: 30, fats: 2 },
    tip: 'Similar to Eromba of Manipur.',
  },

  // --- UTTAR PRADESH ---
  {
    _id: 'up-1',
    title: 'Tehri',
    state: 'Uttar Pradesh',
    time: '30 min',
    ingredients: [{ item: 'Rice' }, { item: 'Potatoes' }, { item: 'Cauliflower' }, { item: 'Peas' }, { item: 'Turmeric' }],
    instructions: ['Sauté veggies in mustard oil.', 'Add rice and turmeric (signature yellow color).', 'Pressure cook.', 'Serve with curd.'],
    macros: { calories: 320, protein: 6, carbs: 60, fats: 8 },
    tip: 'The vibrant yellow color from turmeric is what makes it Tehri, not Pulao.',
  },
  {
    _id: 'up-2',
    title: 'Aloo Puri',
    state: 'Uttar Pradesh',
    time: '30 min',
    ingredients: [{ item: 'Potatoes' }, { item: 'Tomato' }, { item: 'Wheat Flour' }, { item: 'Cumin' }, { item: 'Oil' }],
    instructions: ['Make a spicy, watery potato curry (Rasedar Aloo).', 'Fry wheat flour puris.', 'Classic breakfast.'],
    macros: { calories: 450, protein: 8, carbs: 65, fats: 20 },
    tip: 'The potato curry should be soupy to dip the puris.',
  },
  {
    _id: 'up-3',
    title: 'Banarasi Tamatar Chaat',
    state: 'Uttar Pradesh',
    time: '20 min',
    ingredients: [{ item: 'Tomatoes' }, { item: 'Potatoes' }, { item: 'Spices' }, { item: 'Sugar syrup' }, { item: 'Sev' }],
    instructions: ['Mash tomatoes and boiled potatoes on tawa.', 'Add spices and sugar syrup.', 'Serve hot topped with sev.'],
    macros: { calories: 200, protein: 3, carbs: 35, fats: 8 },
    tip: 'Unique mix of sweet and spicy.',
  },

  // --- UTTARAKHAND ---
  {
    _id: 'uk-1',
    title: 'Aloo Ke Gutke',
    state: 'Uttarakhand',
    time: '15 min',
    ingredients: [{ item: 'Boiled Potatoes' }, { item: 'Jakhya (Wild Mustard)' }, { item: 'Red Chili' }, { item: 'Coriander' }, { item: 'Mustard Oil' }],
    instructions: ['Cut boiled potatoes into wedges.', 'Temper with Jakhya and chilies in mustard oil.', 'Toss well.'],
    macros: { calories: 180, protein: 3, carbs: 35, fats: 5 },
    tip: 'Jakhya seeds give a crunch that cumin cannot replace.',
  },
  {
    _id: 'uk-2',
    title: 'Kafuli',
    state: 'Uttarakhand',
    time: '30 min',
    ingredients: [{ item: 'Spinach' }, { item: 'Fenugreek Leaves' }, { item: 'Rice Flour' }, { item: 'Curd' }, { item: 'Spices' }],
    instructions: ['Boil and mash greens.', 'Cook with rice flour paste (alan) to thicken.', 'Simmer.', 'Serve with rice.'],
    macros: { calories: 140, protein: 6, carbs: 15, fats: 4 },
    tip: 'A rich green healthy curry.',
  },
  {
    _id: 'uk-3',
    title: 'Chainsoo',
    state: 'Uttarakhand',
    time: '35 min',
    ingredients: [{ item: 'Black Urad Dal' }, { item: 'Garlic' }, { item: 'Coriander' }, { item: 'Spices' }, { item: 'Iron Kadai' }],
    instructions: ['Dry roast dal and grind coarsely.', 'Fry in oil with garlic.', 'Add water and simmer in iron kadai.'],
    macros: { calories: 220, protein: 12, carbs: 30, fats: 6 },
    tip: 'Cooking in an iron kadai enhances the taste and nutrition.',
  }
];

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================

export default function DailyDishesPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<StaticRecipe | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All Staples');
  const [savedRecipeTitles, setSavedRecipeTitles] = useState<Set<string>>(new Set()); // Track saved recipes
  const { showToast, toasts, removeToast } = useToast();

  // Fetch saved recipes on mount
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const res = await fetch('/api/recipes'); // Fetches user recipes by default logic in route.ts
        if (res.ok) {
            const data = await res.json();
            if (data.recipes) {
                const titles = new Set(data.recipes.map((r: any) => r.title));
                setSavedRecipeTitles(titles as Set<string>);
            }
        }
      } catch (error) {
        console.error('Failed to sync cookbook status');
      }
    };
    fetchSavedRecipes();
  }, []);

  const states = useMemo(() => {
    const allStates = Array.from(new Set(readyRecipes.map(r => r.state)));
    const otherStates = allStates.filter(s => s !== 'West Bengal').sort();
    return ['All Staples', 'West Bengal', ...otherStates];
  }, []);

  const displayedRecipes = useMemo(() => {
    if (activeFilter === 'All Staples') return readyRecipes;
    return readyRecipes.filter(r => r.state === activeFilter);
  }, [activeFilter]);

  const handleSaveToCookbook = async (recipe: any) => {
    // Prevent duplicate saving
    if (savedRecipeTitles.has(recipe.title)) return;

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title,
          time: recipe.time,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          macros: recipe.macros,
          tip: recipe.tip,
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      showToast('Recipe saved to your cookbook!', 'success');
      setSavedRecipeTitles(prev => new Set(prev).add(recipe.title)); // Update local state immediately
      setSelectedRecipe(null);
    } catch (error) {
      showToast('Failed to save recipe', 'error');
    }
  };

  const RecipeCard = ({ recipe }: { recipe: StaticRecipe }) => {
    const isSaved = savedRecipeTitles.has(recipe.title); // Check if this specific recipe is saved

    return (
      <div className="bg-white border-4 border-black shadow-brutal text-black hover:shadow-brutal-lg transition-all flex flex-col h-full group relative overflow-hidden">
        {/* Premium Badge / Logo overlay */}
        <div className="border-b-4 border-black p-4 md:p-6 bg-chefini-yellow relative">
           {/* State Badge */}
          <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-xs font-bold uppercase tracking-wider">
            {recipe.state}
          </div>
          
          <h3 className="text-xl md:text-2xl font-black mb-3 line-clamp-2 selectable mt-4">
            {recipe.title}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs md:text-sm font-bold">
            <span className="flex items-center gap-1"><Clock size={16} /> {recipe.time}</span>
            <span className="flex items-center gap-1"><Flame size={16} /> {recipe.macros.calories} cal</span>
          </div>
        </div>

        <div className="p-4 md:p-6 flex-1 flex flex-col">
          {/* Creator Info - Enhanced */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-gray-300">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-black text-chefini-yellow border-2 border-chefini-yellow flex items-center justify-center rounded-full shadow-sm">
                 <ChefHat size={20} className="md:w-6 md:h-6" />
             </div>
             <div>
                <p className="font-black text-base md:text-lg leading-none">Chefini <span className="text-chefini-yellow bg-black px-1 text-xs md:text-sm">GOLD</span></p>
                <p className="text-[10px] md:text-xs text-gray-500 font-bold">Premium Collection</p>
             </div>
          </div>

          {/* Vibrant Magic Tip */}
          <div className="mb-4 bg-purple-50 p-3 md:p-4 border-l-4 border-purple-600 text-xs md:text-sm text-purple-900 font-medium italic relative">
            <Sparkles className="absolute -top-2 -right-2 text-purple-500 fill-purple-200" size={16} />
            <span className="not-italic font-bold block text-[10px] md:text-xs text-purple-600 mb-1">✨ MAGIC TIP:</span>
            "{recipe.tip}"
          </div>

          <div className="mb-4 flex-1">
            <p className="text-xs md:text-sm font-bold text-gray-700 mb-2">Core Ingredients:</p>
            <ul className="text-xs md:text-sm space-y-1">
              {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-chefini-yellow font-black">▪</span>
                  <span className="line-clamp-1">{ing.item}</span>
                </li>
              ))}
              {recipe.ingredients.length > 3 && (
                <li className="text-gray-500 italic pl-3">
                  + {recipe.ingredients.length - 3} more...
                </li>
              )}
            </ul>
          </div>

          <div className="flex gap-2 mt-auto">
            <button onClick={() => setSelectedRecipe(recipe)} className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-chefini-yellow text-black font-bold border-2 border-black hover:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
              <Eye size={16} className="md:w-[18px] md:h-[18px]" />
              View Recipe
            </button>
             <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isSaved) handleSaveToCookbook(recipe); 
                }} 
                disabled={isSaved}
                className={`px-3 py-2 md:px-4 md:py-3 border-2 border-black font-bold transition-all flex items-center gap-2 ${
                    isSaved 
                    ? 'bg-green-100 text-green-700 border-green-600 cursor-default' 
                    : 'bg-white hover:bg-gray-100 text-green-600'
                }`}
                title={isSaved ? "Already saved" : "Save Copy to My Cookbook"}
            >
              {isSaved ? <Check size={16} className="md:w-[18px] md:h-[18px]" /> : <BookmarkPlus size={16} className="md:w-[18px] md:h-[18px]" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
       {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

       <div className="mb-4 md:mb-8 bg-black border-4 border-chefini-yellow p-4 md:p-6 mx-4 md:mx-8 mt-4 md:mt-8">
        <h1 className="text-2xl md:text-4xl font-black flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 text-white">
          <Utensils className="text-chefini-yellow w-8 h-8 md:w-10 md:h-10" />
          INDIAN STAPLES
        </h1>
        <p className="text-gray-400 mt-2 font-bold text-sm md:text-base">
          A culinary journey through India • {readyRecipes.length} recipes from 28 states and 8 union territories
        </p>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-6 md:mb-10 flex gap-2 md:gap-3 overflow-x-auto pb-4 no-scrollbar">
          {states.map((state) => (
            <button key={state} onClick={() => setActiveFilter(state)} className={`px-4 py-1.5 md:px-6 md:py-2 text-sm md:text-base font-black border-4 border-black whitespace-nowrap transition-all shadow-brutal-sm ${activeFilter === state ? 'bg-chefini-yellow text-black scale-105' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              {state}
            </button>
          ))}
        </div>

        <div className="mb-6 md:mb-8 flex items-center gap-4">
          <h2 className="text-xl md:text-3xl font-black text-black bg-white border-4 border-black px-4 py-1.5 md:px-6 md:py-2 shadow-brutal-sm inline-flex items-center gap-2 transform -rotate-1">
            <MapPin className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
            {activeFilter === 'All Staples' ? 'Pan-India Collection' : `${activeFilter} Specials`}
          </h2>
          <div className="h-1 bg-black flex-1 rounded-full opacity-20 border-t-2 border-black border-dashed"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedRecipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
        
        {displayedRecipes.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-bold">
            No recipes found for this state.
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          showToast={showToast}
          onSaveToCookbook={handleSaveToCookbook}
          isSaved={savedRecipeTitles.has(selectedRecipe.title)} // Pass saved status to modal
        />
      )}
    </div>
  );
}