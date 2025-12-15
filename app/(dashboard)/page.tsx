'use client';

import { useState } from 'react';
import {
  Sparkles,
  ChefHat,
  Target,
  Volume2,
  ShoppingCart,
  Leaf,
  Wheat,
  Drumstick
} from 'lucide-react';

import TagInput from '@/components/ui/TagInput';
import ChefiniButton from '@/components/ui/ChefiniButton';

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

  const dietaryOptions = [
    { id: 'vegan', label: 'Vegan', icon: Leaf },
    { id: 'keto', label: 'Keto', icon: Drumstick },
    { id: 'gluten-free', label: 'Gluten-Free', icon: Wheat }
  ];

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
      alert(error.message);
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
      utterance.rate = 0.9;
      utterance.onend = () => setIsReading(false);

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

      alert(`Added "${item}" to your shopping list!`);
    } catch (error) {
      alert('Failed to add to shopping list');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-black border-4 border-chefini-yellow p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-black mb-6 flex items-center gap-2 text-white">
            <Sparkles className="text-chefini-yellow flex-shrink-0" />
            WHAT'S IN YOUR KITCHEN?
          </h2>

          <TagInput
            tags={ingredients}
            setTags={setIngredients}
            placeholder="Type ingredient (e.g., chicken, rice...)"
          />

          {/* Staples Toggle */}
          <div className="mt-4 flex items-start sm:items-center gap-3 text-white">
            <input
              type="checkbox"
              id="staples"
              checked={staples}
              onChange={(e) => setStaples(e.target.checked)}
              className="w-6 h-6 accent-chefini-yellow flex-shrink-0 mt-1 sm:mt-0"
            />
            <label htmlFor="staples" className="font-bold cursor-pointer text-sm sm:text-base leading-tight sm:leading-normal">
              Include Kitchen Staples (Oil, Salt, Pepper)
            </label>
          </div>

          {/* Dietary Filters */}
          <div className="mt-6">
            <h3 className="font-black mb-3 text-white">DIETARY PREFERENCES</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                  className={`px-2 sm:px-4 py-2 border-2 border-white sm:border-black font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all text-xs sm:text-sm md:text-base w-full ${dietary.includes(id)
                      ? 'bg-chefini-yellow text-black border-transparent'
                      : 'bg-transparent sm:bg-white text-white sm:text-black hover:bg-white/10 sm:hover:bg-gray-100'
                    }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Healthy Mode */}
          <div className="mt-6">
            <button
              onClick={() => setHealthyMode(!healthyMode)}
              className={`w-full px-4 py-3 border-2 border-white sm:border-black font-bold flex items-center justify-center gap-2 transition-all ${healthyMode
                  ? 'bg-green-400 text-black border-transparent'
                  : 'bg-transparent sm:bg-white text-white sm:text-black hover:bg-white/10 sm:hover:bg-gray-100'
                }`}
            >
              <Target size={20} />
              MAKE IT HEALTHY MODE {healthyMode ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <ChefiniButton
              onClick={generateRecipe}
              icon={Sparkles}
              disabled={ingredients.length === 0 || loading}
              className="w-full justify-center"
            >
              {loading ? 'COOKING UP MAGIC...' : 'GENERATE RECIPE'}
            </ChefiniButton>
          </div>
        </div>
      </div>

      {/* Recipe Display */}
      <div>
        {loading && (
          <div className="border-4 border-chefini-yellow bg-black p-8 sm:p-12 text-center">
            <ChefHat
              size={64}
              className="mx-auto mb-4 text-chefini-yellow animate-pulse"
            />
            <div className="text-chefini-yellow font-black text-xl animate-pulse">
              CHEFINI IS WORKING MAGIC...
            </div>
          </div>
        )}

        {recipe && !loading && (
          <div className="border-4 border-black bg-white shadow-brutal-lg p-4 sm:p-6 text-black">
            {/* Header */}
            <div className="border-b-2 border-dashed border-black pb-4 mb-4">
              <h2 className="text-2xl sm:text-3xl font-black mb-2">{recipe.title}</h2>

              <div className="flex flex-wrap gap-4 text-sm font-bold">
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
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono">▪</span>
                    <span
                      className={
                        ing.missing
                          ? 'text-red-600 font-bold flex-1'
                          : 'flex-1'
                      }
                    >
                      {ing.item}
                      {ing.missing && (
                        <button
                          onClick={() => addToShoppingList(ing.item)}
                          className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-sm hover:bg-red-600 transition-colors font-bold uppercase"
                        >
                          + Add
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h3 className="text-xl font-black mb-3 flex items-center gap-2">
                <ChefHat size={20} />
                INSTRUCTIONS
                <button
                  onClick={speakInstructions}
                  className={`ml-auto p-2 border-2 border-black ${isReading ? 'bg-chefini-yellow' : 'bg-white'
                    } hover:bg-gray-100 transition-colors`}
                  title="Read instructions aloud"
                >
                  <Volume2 size={20} />
                </button>
              </h3>
              <ol className="space-y-4 list-decimal list-inside marker:font-black">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="text-base sm:text-lg leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Macros - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-6 bg-gray-100 p-3 sm:p-4 border-2 border-black">
              <div className="p-2">
                <div className="font-black text-lg sm:text-xl">{recipe.macros.protein}g</div>
                <div className="text-xs font-bold text-gray-500">PROTEIN</div>
              </div>
              <div className="p-2">
                <div className="font-black text-lg sm:text-xl">{recipe.macros.carbs}g</div>
                <div className="text-xs font-bold text-gray-500">CARBS</div>
              </div>
              <div className="p-2">
                <div className="font-black text-lg sm:text-xl">{recipe.macros.fats}g</div>
                <div className="text-xs font-bold text-gray-500">FATS</div>
              </div>
              <div className="p-2">
                <div className="font-black text-lg sm:text-xl">{recipe.macros.calories}</div>
                <div className="text-xs font-bold text-gray-500">KCAL</div>
              </div>
            </div>

            {/* Chefini Tip */}
            <div className="bg-chefini-yellow border-2 border-black p-4 relative mt-6">
              <div className="absolute -top-3 -left-3 bg-black text-white px-3 py-1 font-black transform -rotate-2 text-xs sm:text-sm">
                ✨ CHEFINI SECRET
              </div>
              <p className="font-bold mt-2 text-black italic text-sm sm:text-base">
                "{recipe.tip}"
              </p>
            </div>
          </div>
        )}

        {!recipe && !loading && (
          <div className="h-full flex items-center justify-center border-4 border-dashed border-gray-300 p-8 sm:p-12 text-gray-400 font-bold text-center min-h-[200px]">
            Waiting for ingredients to work my magic...
          </div>
        )}
      </div>
    </div>
  );
}