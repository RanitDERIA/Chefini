'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ChefHat, Target, Volume2, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // IMPORTED
import AlchemyLoader from '@/components/ui/AlchemyLoader'; // IMPORTED
import { Leaf, Wheat, Drumstick } from 'lucide-react';
import TagInput from '@/components/ui/TagInput';
import ChefiniButton from '@/components/ui/ChefiniButton';

// ⭐ Toast Imports
import Toast from '@/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';


interface Recipe {
  title: string;
  time: string;
  ingredients: Array<{ item: string; missing: boolean }>;
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  tip: string;
}

export default function GeneratePage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [staples, setStaples] = useState(true);
  const [dietary, setDietary] = useState<string[]>([]);
  const [healthyMode, setHealthyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // ⭐ Toast Hook
  const { toasts, showToast, removeToast } = useToast();

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const dietaryOptions = [
    { id: 'vegan', label: 'Vegan', icon: Leaf },
    { id: 'keto', label: 'Keto', icon: Drumstick },
    { id: 'gluten-free', label: 'Gluten-Free', icon: Wheat }
  ];

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
      return { valid: true }; // Fail open
    }
  };

  const generateRecipe = async () => {
    setLoading(true);
    setRecipe(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          dietary,
          healthyMode,
          staples
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate recipe');
      }

      setRecipe(data.recipe);
    } catch (error: any) {
      showToast(error.message, 'error'); // ⭐ replaced alert()
    } finally {
      setLoading(false);
    }
  };

  const speakInstructions = () => {
    if (!recipe || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (!isReading) {
      const text = recipe.instructions
        .map((step, i) => `Step ${i + 1}. ${step}`)
        .join('. ');

      const utterance = new SpeechSynthesisUtterance(text);

      const femaleVoice = voices.find(voice =>
        voice.name.includes('Google US English Female') ||
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Moira') ||
        voice.name.includes('Fiona') ||
        voice.name.includes('Female') ||
        (voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female'))
      );

      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    } else {
      setIsReading(false);
    }
  };

  const addToShoppingList = async (item: string) => {
    try {
      await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item })
      });

      showToast(`Added "${item}" to your shopping list!`, 'success'); // ⭐ replaced alert()
    } catch (error) {
      showToast('Failed to add to shopping list', 'error'); // ⭐ replaced alert()
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">

      {/* ⭐ Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* INPUT SECTION */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-black border-4 border-chefini-yellow p-6">
          <h2 className="text-lg md:text-3xl font-black mb-6 flex items-center gap-2 text-white">
            <Sparkles className="text-chefini-yellow flex-shrink-0" />
            WHAT'S IN YOUR KITCHEN?
          </h2>

          <TagInput
            tags={ingredients}
            setTags={setIngredients}
            placeholder="Type ingredient (e.g., chicken, rice...)"
            onValidate={validateContent}
            onError={(msg) => showToast(msg, 'error')}
          />

          {/* Staples Toggle */}
          <div className="mt-4 flex items-center gap-3 text-white">
            <input
              type="checkbox"
              id="staples"
              checked={staples}
              onChange={(e) => setStaples(e.target.checked)}
              className="w-6 h-6 accent-chefini-yellow"
            />
            <label htmlFor="staples" className="font-bold cursor-pointer">
              Include Kitchen Staples (Oil, Salt, Pepper)
            </label>
          </div>

          {/* Dietary Filters */}
          <div className="mt-6">
            <h3 className="font-black mb-3 text-white">DIETARY PREFERENCES</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {dietaryOptions.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDietary(prev =>
                      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
                    );
                  }}
                  className={`px-2 sm:px-4 py-2 border-2 border-white font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all text-xs sm:text-sm md:text-base w-full ${dietary.includes(id)
                    ? 'bg-chefini-yellow text-black border-chefini-yellow'
                    : 'bg-transparent text-white hover:bg-white/10'
                    }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Healthy Mode */}
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHealthyMode(!healthyMode)}
              className={`w-full px-4 py-3 border-2 border-white font-bold flex items-center justify-center gap-2 transition-all ${healthyMode
                ? 'bg-green-500 text-black border-green-500'
                : 'bg-transparent text-white hover:bg-white/10'
                }`}
            >
              <Target size={20} />
              MAKE IT HEALTHY MODE {healthyMode ? 'ON' : 'OFF'}
            </motion.button>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ChefiniButton
                onClick={generateRecipe}
                icon={Sparkles}
                disabled={ingredients.length === 0 || loading}
                className="w-full justify-center"
              >
                {loading ? 'COOKING UP MAGIC...' : 'GENERATE RECIPE'}
              </ChefiniButton>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE — Recipe Display */}
      <div>
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="border-4 border-chefini-yellow bg-black p-12 text-center"
            >
              <AlchemyLoader text="CONSULTING THE FLAVOR MATRIX..." />
            </motion.div>
          )}

          {!loading && recipe && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="border-4 border-black bg-white shadow-brutal-lg p-6 text-black"
            >
              {/* Header */}
              <div className="border-b-2 border-dashed border-black pb-4 mb-4">
                <h2 className="text-3xl font-black mb-2">{recipe.title}</h2>
                <div className="flex gap-4 text-sm font-bold">
                  <span>⏱️ {recipe.time}</span>
                  <span>🔥 {recipe.macros.calories} cal</span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  INGREDIENTS
                </h3>
                <motion.ul
                  className="space-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                  }}
                >
                  {recipe.ingredients.map((ing, idx) => (
                    <motion.li
                      key={idx}
                      variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                      className="flex items-start gap-2"
                    >
                      <span className="font-mono">▪</span>
                      <span className={ing.missing ? 'text-red-600 font-bold flex-1' : 'flex-1'}>
                        {ing.item}
                        {ing.missing && (
                          <button
                            onClick={() => addToShoppingList(ing.item)}
                            className="ml-2 text-xs bg-red-500 text-white px-2 py-1 border border-black hover:bg-red-600"
                          >
                            ADD TO LIST
                          </button>
                        )}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <ChefHat size={20} />
                    INSTRUCTIONS
                  </h3>
                  <button
                    onClick={speakInstructions}
                    className={`p-2 border-2 border-black transition-colors ${isReading ? 'bg-chefini-yellow' : 'bg-white hover:bg-gray-100'
                      }`}
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="font-black text-lg">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tip */}
              <div className="border-2 border-chefini-yellow bg-chefini-yellow bg-opacity-20 p-4 mb-6">
                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  <Sparkles size={18} />
                  CHEFINI'S MAGIC TIP
                </h3>
                <p className="text-sm">{recipe.tip}</p>
              </div>

              {/* Macros */}
              <div className="pt-4 border-t-2 border-dashed border-black flex flex-wrap justify-around gap-2 md:gap-4 text-center">
                <div className="min-w-[60px]">
                  <div className="font-black text-lg md:text-2xl">{recipe.macros.protein}g</div>
                  <div className="text-[10px] md:text-xs font-bold">PROTEIN</div>
                </div>
                <div className="min-w-[60px]">
                  <div className="font-black text-lg md:text-2xl">{recipe.macros.carbs}g</div>
                  <div className="text-[10px] md:text-xs font-bold">CARBS</div>
                </div>
                <div className="min-w-[60px]">
                  <div className="font-black text-lg md:text-2xl">{recipe.macros.fats}g</div>
                  <div className="text-[10px] md:text-xs font-bold">FATS</div>
                </div>
              </div>
            </motion.div>
          )}

          {!recipe && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border-4 border-chefini-yellow bg-black p-12 text-center"
            >
              <ChefHat size={64} className="mx-auto mb-4 text-chefini-yellow" />
              <p className="text-xl font-bold text-white">Add ingredients and hit Generate!</p>
              <p className="text-gray-400 mt-2">Chefini will work its magic ✨</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
