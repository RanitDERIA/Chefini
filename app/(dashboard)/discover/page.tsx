'use client';

import { useEffect, useState } from 'react';
import { Users, Heart, ChefHat, Eye } from 'lucide-react';
import Toast from '@/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import RecipeModal from '@/components/ui/RecipeModal';
import { getAvatarDisplay } from '@/lib/avatars'; // Import avatar helper

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
  likes: number;
  createdBy: {
    name: string;
    image?: string;
    avatar?: string; // Added avatar field
  };
}

import { motion } from 'framer-motion';

export default function DiscoverPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchPublicRecipes();
    fetchLikedRecipes();
  }, []);

  const fetchPublicRecipes = async () => {
    try {
      const res = await fetch('/api/recipes?type=public');
      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      showToast('Failed to fetch recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedRecipes = async () => {
    try {
      const res = await fetch('/api/recipes/liked');
      const data = await res.json();
      setLikedRecipes(new Set(data.likedRecipes || []));
    } catch (error) {
      console.error('Failed to fetch liked recipes:', error);
    }
  };

  const toggleLike = async (id: string) => {
    const isLiked = likedRecipes.has(id);

    try {
      const res = await fetch('/api/recipes/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: id })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update like');
      }

      // Update local state
      setRecipes(recipes.map(r =>
        r._id === id ? { ...r, likes: data.likes } : r
      ));

      // Update liked recipes set
      const newLikedRecipes = new Set(likedRecipes);
      if (data.liked) {
        newLikedRecipes.add(id);
        showToast('Recipe liked!', 'success');
      } else {
        newLikedRecipes.delete(id);
        showToast('Recipe unliked', 'info');
      }
      setLikedRecipes(newLikedRecipes);

      // Update modal recipe if it's open
      if (selectedRecipe && selectedRecipe._id === id) {
        setSelectedRecipe({ ...selectedRecipe, likes: data.likes });
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update like', 'error');
    }
  };

  const saveToCookbook = async (recipe: any) => {
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
      setSelectedRecipe(null);
    } catch (error) {
      showToast('Failed to save recipe', 'error');
    }
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

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Users size={64} className="mx-auto mb-4 text-chefini-yellow animate-pulse" />
        <p className="text-xl font-bold">Loading community recipes...</p>
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
        onSaveToCookbook={saveToCookbook}
        onLike={toggleLike}
        showActions={true}
        showToast={showToast}
        isLiked={selectedRecipe ? likedRecipes.has(selectedRecipe._id) : false}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8 bg-black border-4 border-chefini-yellow p-6"
      >
        <h1 className="text-4xl font-black flex items-center gap-3">
          <Users className="text-chefini-yellow" size={40} />
          DISCOVER RECIPES
        </h1>
        <p className="text-gray-400 mt-2">
          Explore magical creations from the Chefini community • {recipes.length} recipes
        </p>
      </motion.div>

      {recipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-4 border-chefini-yellow bg-black p-12 text-center"
        >
          <Users size={64} className="mx-auto mb-4 text-chefini-yellow" />
          <h2 className="text-2xl font-black mb-2">NO PUBLIC RECIPES YET</h2>
          <p className="text-gray-400">Be the first to share your creation!</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {recipes.map((recipe) => {
            const isLiked = likedRecipes.has(recipe._id);

            // Calculate Avatar Display for each creator
            const creatorAvatar = getAvatarDisplay({
              name: recipe.createdBy.name,
              image: recipe.createdBy.image,
              avatar: recipe.createdBy.avatar
            });

            return (
              <motion.div
                key={recipe._id}
                variants={item}
                className="bg-white border-4 border-black shadow-brutal text-black hover:shadow-brutal-lg transition-all group"
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
                  {/* Creator Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-gray-300">
                    {creatorAvatar.type === 'image' ? (
                      <img
                        src={creatorAvatar.value}
                        alt={recipe.createdBy.name}
                        className="w-10 h-10 border-2 border-black object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-chefini-yellow border-2 border-black flex items-center justify-center font-black">
                        {creatorAvatar.value}
                      </div>
                    )}
                    <div>
                      <p className="font-bold selectable">{recipe.createdBy.name}</p>
                      <p className="text-xs text-gray-600">Chef</p>
                    </div>
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
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="flex-1 px-4 py-3 bg-chefini-yellow text-black font-bold border-2 border-black hover:shadow-brutal-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Full Recipe
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleLike(recipe._id)}
                      className={`px-4 py-3 border-2 border-black font-bold transition-all flex items-center gap-2 ${isLiked
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white text-black hover:bg-red-100'
                        }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        size={18}
                        className={isLiked ? 'fill-white' : 'fill-none text-red-500'}
                      />
                      <span>{recipe.likes}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}