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
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-black border-4 border-chefini-yellow p-6">
          <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
            <Sparkles className="text-chefini-yellow" />
            WHAT'S IN YOUR KITCHEN?
          </h2>

          <TagInput
            tags={ingredients}
            setTags={setIngredients}
            placeholder="Type ingredient (e.g., chicken, rice...)"
          />

          {/* Staples Toggle */}
          <div className="mt-4 flex items-center gap-3">
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
            <h3 className="font-black mb-3">DIETARY PREFERENCES</h3>
            <div className="flex flex-wrap gap-3">
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
                  className={`px-4 py-2 border-2 border-black font-bold flex items-center gap-2 transition-all ${
                    dietary.includes(id)
                      ? 'bg-chefini-yellow text-black'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Healthy Mode */}
          <div className="mt-6">
            <button
              onClick={() => setHealthyMode(!healthyMode)}
              className={`w-full px-4 py-3 border-2 border-black font-bold flex items-center justify-center gap-2 transition-all ${
                healthyMode
                  ? 'bg-green-400 text-black'
                  : 'bg-white text-black hover:bg-gray-100'
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
          <div className="border-4 border-chefini-yellow bg-black p-12 text-center">
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
          <div className="border-4 border-black bg-white shadow-brutal-lg p-6 text-black">
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
                          className="ml-2 text-xs bg-red-500 text-white p
