'use client';

import { useEffect, useState } from 'react';
import { ChefHat, Trash2, Globe, Eye } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import RecipeModal from '@/components/ui/RecipeModal';

interface Recipe {
  _id: string;
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
  isPublic: boolean;
  likes: number;
  createdAt: string;
}

export default function CookbookPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes?type=my');
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      showToast('Failed to fetch recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/recipes?id=${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        throw new Error('Failed to delete');
      }

      setRecipes(recipes.filter(r => r._id !== id));
      
      // Close modal if the deleted recipe is open
      if (selectedRecipe?._id === id) {
        setSelectedRecipe(null);
      }
      
      showToast(`"${title}" deleted successfully`, 'success');
    } catch (error) {
      showToast('Failed to delete recipe', 'error');
    }
  };

  const togglePublic = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/recipes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: id,
          updates: { isPublic: !currentStatus }
        })
      });

      const data = await res.json();
      
      // Update in list
      setRecipes(recipes.map(r => 
        r._id === id ? { ...r, isPublic: data.recipe.isPublic } : r
      ));
      
      // Update modal if open
      if (selectedRecipe?._id === id) {
        setSelectedRecipe({ ...selectedRecipe, isPublic: data.recipe.isPublic });
      }
      
      showToast(
        data.recipe.isPublic ? 'Recipe is now public!' : 'Recipe is now private',
        'info'
      );
    } catch (error) {
      showToast('Failed to update recipe', 'error');
    }
  };

  const handleDeleteFromModal = (recipeId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteRecipe(recipeId, title);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <ChefHat size={64} className="mx-auto mb-4 text-chefini-yellow animate-pulse" />
        <p className="text-xl font-bold">Loading your cookbook...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={selectedRecipe !== null}
        onClose={() => setSelectedRecipe(null)}
        onTogglePublic={selectedRecipe ? () => togglePublic(selectedRecipe._id, selectedRecipe.isPublic) : undefined}
        onDelete={selectedRecipe ? () => handleDeleteFromModal(selectedRecipe._id, selectedRecipe.title) : undefined}
        showActions={true}
        showToast={showToast}
        isOwner={true}
        isPublic={selectedRecipe?.isPublic}
      />

      {/* Header */}
      <div className="mb-8 bg-black border-4 border-chefini-yellow p-6">
        <h1 className="text-4xl font-black flex items-center gap-3">
          <ChefHat className="text-chefini-yellow" size={40} />
          MY COOKBOOK
        </h1>
        <p className="text-gray-400 mt-2">
          All your magical creations in one place • {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="border-4 border-chefini-yellow bg-black p-12 text-center">
          <ChefHat size={64} className="mx-auto mb-4 text-chefini-yellow" />
          <h2 className="text-2xl font-black mb-2">NO RECIPES YET</h2>
          <p className="text-gray-400">Generate your first recipe to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white border-4 border-black shadow-brutal text-black hover:shadow-brutal-lg transition-all"
            >
              {/* Card Header */}
              <div className="border-b-4 border-black p-6 bg-chefini-yellow">
                <h3 className="text-2xl font-black mb-3 selectable line-clamp-2">
                  {recipe.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm font-bold">
                  <span>⏱️ {recipe.time}</span>
                  <span>🔥 {recipe.macros.calories} cal</span>
                  <span>🥘 {recipe.ingredients.length} items</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold border-2 border-black ${
                      recipe.isPublic
                        ? 'bg-green-400 text-black'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {recipe.isPublic ? '🌍 PUBLIC' : '🔒 PRIVATE'}
                  </span>
                  {recipe.isPublic && (
                    <span className="ml-2 text-xs font-bold text-gray-600">
                      ❤️ {recipe.likes} {recipe.likes === 1 ? 'like' : 'likes'}
                    </span>
                  )}
                </div>

                {/* Quick Preview */}
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">Ingredients Preview:</p>
                  <ul className="text-sm space-y-1">
                    {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-chefini-yellow">▪</span>
                        <span className="line-clamp-1">{ing.item}</span>
                      </li>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <li className="text-gray-500 italic">
                        + {recipe.ingredients.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4 p-3 bg-gray-100 border-2 border-gray-300">
                  <div>
                    <div className="font-black text-lg">{recipe.macros.protein}g</div>
                    <div className="text-gray-600">Protein</div>
                  </div>
                  <div>
                    <div className="font-black text-lg">{recipe.macros.carbs}g</div>
                    <div className="text-gray-600">Carbs</div>
                  </div>
                  <div>
                    <div className="font-black text-lg">{recipe.macros.fats}g</div>
                    <div className="text-gray-600">Fats</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {/* View Recipe Button */}
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="w-full px-4 py-3 bg-chefini-yellow text-black font-bold border-2 border-black hover:shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={18} />
                    View Full Recipe
                  </button>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePublic(recipe._id, recipe.isPublic)}
                      className={`flex-1 px-3 py-2 border-2 border-black font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                        recipe.isPublic 
                          ? 'bg-green-400 hover:bg-green-500' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      title={recipe.isPublic ? 'Make Private' : 'Make Public'}
                    >
                      <Globe size={16} />
                      {recipe.isPublic ? 'Public' : 'Private'}
                    </button>
                    
                    <button
                      onClick={() => deleteRecipe(recipe._id, recipe.title)}
                      className="px-3 py-2 border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Delete Recipe"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}