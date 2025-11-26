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
    Share2, // Added Share2 icon
    ListPlus // Added ListPlus for distinct shopping list icon
} from 'lucide-react';

import { useState } from 'react';

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
    // New Props for added options
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
    onAddToShoppingList, // Destructure new prop
    onShare,            // Destructure new prop
    showActions = true,
    showToast,
    isLiked = false,
    isOwner = false,
    isPublic = false
}: RecipeModalProps) {
    const [isReading, setIsReading] = useState(false);
    const [downloading, setDownloading] = useState(false);

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

            // 2. Wait for rendering
            await new Promise(r => setTimeout(r, 200)); // Increased timeout slightly to ensure footer renders

            // 3. Create Canvas
            const canvas = await html2canvas(tempDiv, {
                backgroundColor: '#fff',
                scale: 2,
                logging: false,
                useCORS: true,
                width: 800
            });

            document.body.removeChild(tempDiv);

            // 4. Calculate Dimensions (CRITICAL FIX FOR FOOTER/TIP)
            // Instead of forcing A4, we calculate the PDF size based on the content height
            const imgData = canvas.toDataURL('image/png');
            const imgWidthPx = canvas.width;
            const imgHeightPx = canvas.height;

            // Convert pixels to mm (1px approx 0.264583mm at 96dpi)
            // But since we scaled canvas by 2, we adjust math:
            // Let's standardise width to A4 width (210mm) and let height be dynamic
            const pdfWidth = 210;
            const pdfHeight = (imgHeightPx * pdfWidth) / imgWidthPx;

            // 5. Initialize PDF with CUSTOM page size to fit everything
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: [pdfWidth, pdfHeight] // <--- THIS FIXES THE CUTOFF
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
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-70"
                onClick={onClose}
            ></div>

            {/* Modal container */}
            <div className="relative bg-white border-4 border-black shadow-brutal-lg max-w-4xl w-full my-8">

                {/* Header */}
                <div className="bg-chefini-yellow border-b-4 border-black p-6 sticky top-0 z-10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-3xl font-black text-black mb-2 selectable">{recipe.title}</h2>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-black">
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
                        <div className="mt-4 flex flex-wrap gap-2">
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
                                className={`px-4 py-2 font-bold border-2 border-black flex items-center gap-2 ${isReading ? 'bg-chefini-yellow' : 'bg-white hover:bg-gray-100'}`}
                            >
                                <Volume2 size={18} /> {isReading ? 'Stop' : 'Read'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div id="recipe-modal-content" className="p-6 bg-white text-black max-h-[70vh] overflow-y-auto">

                    {/* Ingredients */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                            <ShoppingCart size={24} /> INGREDIENTS
                        </h3>
                        <ul className="space-y-2 selectable">
                            {recipe.ingredients.map((ing, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-lg">
                                    <span className="font-mono text-chefini-yellow">▪</span>
                                    <span>{ing.item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-black mb-4">INSTRUCTIONS</h3>
                        <ol className="space-y-4 selectable">
                            {recipe.instructions.map((step, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <span className="font-black text-xl text-chefini-yellow min-w-[30px]">{idx + 1}.</span>
                                    <span className="text-lg">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Magic Tip */}
                    <div className="border-4 border-chefini-yellow bg-chefini-yellow bg-opacity-20 p-6 mb-6">
                        <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                            <Sparkles size={20} /> CHEFINI'S MAGIC TIP
                        </h3>
                        <p className="text-base selectable">{recipe.tip}</p>
                    </div>

                    {/* Macros */}
                    <div className="border-t-4 border-dashed border-black pt-6">
                        <h3 className="text-xl font-black mb-4">NUTRITIONAL INFO</h3>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="font-black text-3xl text-chefini-yellow">{recipe.macros.calories}</div>
                                <div className="text-sm font-bold">CALORIES</div>
                            </div>
                            <div>
                                <div className="font-black text-3xl text-chefini-yellow">{recipe.macros.protein}g</div>
                                <div className="text-sm font-bold">PROTEIN</div>
                            </div>
                            <div>
                                <div className="font-black text-3xl text-chefini-yellow">{recipe.macros.carbs}g</div>
                                <div className="text-sm font-bold">CARBS</div>
                            </div>
                            <div>
                                <div className="font-black text-3xl text-chefini-yellow">{recipe.macros.fats}g</div>
                                <div className="text-sm font-bold">FATS</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
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