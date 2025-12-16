'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Download,
  FileText,
  Image as ImageIcon,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import ChefiniButton from '@/components/ui/ChefiniButton';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import OrderItemModal from '@/components/ui/OrderItemModal';

// Helper to load external scripts dynamically (Same as RecipeModal)
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

// Helper for HTML escaping
function escapeHtml(input: string) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedItemToOrder, setSelectedItemToOrder] = useState<string | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch('/api/shopping-list');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      showToast('Failed to load shopping list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newItem.trim() })
      });

      const data = await res.json();
      setItems(data.items);
      setNewItem('');
      showToast(`Added "${newItem}" to your list!`, 'success');
    } catch (error) {
      showToast('Failed to add item', 'error');
    }
  };

  const removeItem = async (item: string) => {
    try {
      const res = await fetch(`/api/shopping-list?item=${encodeURIComponent(item)}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      setItems(data.items);
      setCheckedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item);
        return newSet;
      });
      showToast('Item removed', 'info');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const clearCompleted = () => {
    checkedItems.forEach(item => removeItem(item));
    showToast('Cleared completed items', 'success');
  };

  const handleOrderClick = (item: string) => {
    setSelectedItemToOrder(item);
  };

  const handleOrderSuccess = (serviceName: string) => {
    showToast(`Opening ${serviceName}...`, 'success');
  };

  // ------------------------------------
  // 📄 DOWNLOAD PDF (Updated Style)
  // ------------------------------------
  const downloadPDF = async () => {
    if (items.length === 0) {
      showToast('Your shopping list is empty!', 'error');
      return;
    }
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

      // --- HTML TEMPLATE ---
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; background: white; width: 800px;">
          <div style="background: #FFC72C; padding: 40px; text-align: center; border: 4px solid #000; border-bottom: none;">
            <div style="font-size: 48px; font-weight: 900; color: #000;">CHEFINI</div>
            <div style="font-size: 14px; color: #000; font-weight: bold; margin-top: 8px;">Smart Shopping List</div>
          </div>

          <div style="background: white; padding: 30px; text-align: center; border-left:4px solid #000; border-right:4px solid #000;">
            <div style="font-size: 14px; color: #666; font-weight: bold;">
              Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style="font-size: 18px; font-weight: 900; margin-top: 10px; color: #000;">
              🛒 ${items.length} Items Total
            </div>
          </div>

          <div style="padding: 40px; border-left:4px solid #000; border-right:4px solid #000; border-bottom:4px solid #000;">
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000; border-bottom: 2px solid #FFC72C; padding-bottom: 10px;">YOUR ITEMS</h2>
              
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
      doc.save(`Chefini_List_${new Date().toISOString().split('T')[0]}.pdf`);

      showToast('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // ------------------------------------
  // 📸 DOWNLOAD IMAGE (Updated Style)
  // ------------------------------------
  const downloadImage = async () => {
    if (items.length === 0) {
      showToast('Your shopping list is empty!', 'error');
      return;
    }
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

      // --- SAME HTML TEMPLATE AS PDF ---
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; background: white; width: 800px;">
          <div style="background: #FFC72C; padding: 40px; text-align: center; border: 4px solid #000; border-bottom: none;">
            <div style="font-size: 48px; font-weight: 900; color: #000;">CHEFINI</div>
            <div style="font-size: 14px; color: #000; font-weight: bold; margin-top: 8px;">Smart Shopping List</div>
          </div>

          <div style="background: white; padding: 30px; text-align: center; border-left:4px solid #000; border-right:4px solid #000;">
            <div style="font-size: 14px; color: #666; font-weight: bold;">
              Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style="font-size: 18px; font-weight: 900; margin-top: 10px; color: #000;">
              🛒 ${items.length} Items Total
            </div>
          </div>

          <div style="padding: 40px; border-left:4px solid #000; border-right:4px solid #000; border-bottom:4px solid #000;">
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px; color: #000; border-bottom: 2px solid #FFC72C; padding-bottom: 10px;">YOUR ITEMS</h2>
              
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

      // Fix: Explicitly typed 'blob' as Blob | null
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) throw new Error('Blob creation failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chefini_List_${new Date().toISOString().split('T')[0]}.png`;
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

  if (loading) {
    return (
      <div className="text-center py-12" suppressHydrationWarning>
        <ShoppingCart size={64} className="mx-auto mb-4 text-chefini-yellow animate-pulse" />
        <p className="text-xl font-bold">Loading your shopping list...</p>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Order Item Modal */}
      <OrderItemModal
        item={selectedItemToOrder || ''}
        isOpen={selectedItemToOrder !== null}
        onClose={() => setSelectedItemToOrder(null)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Header */}
      <div className="mb-8 bg-black border-4 border-chefini-yellow p-6">
        <h1 className="text-4xl font-black flex items-center gap-3">
          <ShoppingCart className="text-chefini-yellow" size={40} />
          SMART SHOPPING LIST
        </h1>
        <p className="text-gray-400 mt-2">
          Never forget an ingredient again! • Order items individually online
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Item Section */}
        <div className="lg:col-span-1">
          <div className="bg-black border-4 border-chefini-yellow p-6 sticky top-6">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
              <Plus className="text-chefini-yellow" />
              ADD ITEM
            </h2>

            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
              placeholder="e.g., Tomatoes, Olive Oil..."
              className="w-full px-4 py-3 border-2 border-white bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-chefini-yellow mb-4 font-bold"
            />

            <ChefiniButton
              onClick={addItem}
              icon={Plus}
              disabled={!newItem.trim()}
              className="w-full justify-center"
            >
              ADD TO LIST
            </ChefiniButton>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-600">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-black text-chefini-yellow">{items.length}</div>
                  <div className="text-xs text-gray-400">TOTAL ITEMS</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-400">{checkedItems.size}</div>
                  <div className="text-xs text-gray-400">COMPLETED</div>
                </div>
              </div>

              {checkedItems.size > 0 && (
                <button
                  onClick={clearCompleted}
                  className="w-full mt-4 px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600"
                >
                  Clear Completed
                </button>
              )}
            </div>

            {/* Export Options */}
            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-600">
                <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                  <Download className="text-chefini-yellow" size={20} />
                  EXPORT LIST
                </h3>

                <div className="space-y-2">
                  <button
                    onClick={downloadPDF}
                    disabled={exportLoading}
                    className="w-full px-4 py-3 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FileText size={20} />
                    Download PDF
                  </button>

                  <button
                    onClick={downloadImage}
                    disabled={exportLoading}
                    className="w-full px-4 py-3 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ImageIcon size={20} />
                    Download Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shopping List Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Banner */}
          {items.length > 0 && (
            <div className="bg-chefini-yellow border-4 border-black p-4 flex items-start gap-3">
              <ShoppingBag size={24} className="text-black flex-shrink-0 mt-1" />
              <div>
                <p className="font-black text-black text-lg mb-1">ORDER ONLINE</p>
                <p className="text-sm text-black font-bold">
                  Click &quot;Order&quot; on any item to purchase it from Blinkit, Zepto, Amazon Fresh,
                  Swiggy Instamart, BigBasket, Jiomart and Dealshare.
                </p>
              </div>
            </div>
          )}

          {/* Items List */}
          {items.length === 0 ? (
            <div className="border-4 border-chefini-yellow bg-black p-12 text-center">
              <ShoppingCart size={64} className="mx-auto mb-4 text-chefini-yellow" />
              <h2 className="text-2xl font-black mb-2">YOUR LIST IS EMPTY</h2>
              <p className="text-gray-400">Add items manually or generate a recipe with missing ingredients!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const isChecked = checkedItems.has(item);

                return (
                  <div
                    key={idx}
                    className={`bg-white border-4 border-black shadow-brutal transition-all ${isChecked ? 'opacity-50' : ''
                      }`}
                  >
                    <div className="p-4 flex items-center gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCheck(item)}
                        className={`w-8 h-8 border-4 border-black flex items-center justify-center transition-colors flex-shrink-0 ${isChecked ? 'bg-green-400' : 'bg-white'
                          }`}
                      >
                        {isChecked && <Check size={20} className="text-black font-black" />}
                      </button>

                      {/* Item Name */}
                      <span
                        className={`flex-1 text-black font-bold text-lg ${isChecked ? 'line-through' : ''
                          }`}
                      >
                        {item}
                      </span>

                      {/* Order Button */}
                      <button
                        onClick={() => handleOrderClick(item)}
                        className="px-4 py-2 bg-chefini-yellow text-black font-bold border-2 border-black hover:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
                        title="Order this item"
                      >
                        <ShoppingBag size={18} />
                        <span className="hidden sm:inline">Order</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeItem(item)}
                        className="p-2 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}