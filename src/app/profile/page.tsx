'use client';

import { useState, useEffect } from 'react';
import { Recipe, Ingredient, Instruction } from '@/types/recipe';
import { recipeService } from '@/services/recipeService';
import { RecipeCard } from '@/components/RecipeCard';
import { toast } from 'react-hot-toast';

type RecipeWithRelations = Recipe & {
  ingredients: Ingredient[];
  instructions: Instruction[];
};

export default function Profile() {
  const [createdRecipes, setCreatedRecipes] = useState<RecipeWithRelations[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');

  // TODO: Replace with actual user ID from authentication
  const mockUserId = 'user123';

  useEffect(() => {
    async function loadUserRecipes() {
      try {
        setLoading(true);
        const [created, saved] = await Promise.all([
          recipeService.getUserRecipes(mockUserId),
          recipeService.getSavedRecipes(mockUserId)
        ]);
        
        setCreatedRecipes(created || []);
        setSavedRecipes(saved || []);
      } catch (error) {
        console.error('Error loading recipes:', error);
        toast.error('Failed to load recipes. Please try again.', {
          icon: '❌',
          style: {
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            padding: '16px',
            color: '#991B1B',
          },
        });
      } finally {
        setLoading(false);
      }
    }

    loadUserRecipes();
  }, []);

  const handleUnsaveRecipe = async (recipeId: number) => {
    try {
      await recipeService.unsaveRecipe(mockUserId, recipeId);
      setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error('Error unsaving recipe:', error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-md mb-8">
          <h1 className="text-4xl font-bold mb-4">My Profile</h1>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Chef Name</h2>
              <p className="text-gray-600">Member since {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-semibold ${
                activeTab === 'created'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
              onClick={() => setActiveTab('created')}
            >
              My Recipes ({createdRecipes.length})
            </button>
            <button
              className={`px-4 py-2 font-semibold ${
                activeTab === 'saved'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-orange-500'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Recipes ({savedRecipes.length})
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-gray-600">Loading recipes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'created' ? (
                createdRecipes.length > 0 ? (
                  createdRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe}
                      showEditButton
                    />
                  ))
                ) : (
                  <p className="col-span-3 text-center text-gray-600">
                    You haven't created any recipes yet.
                  </p>
                )
              ) : (
                savedRecipes.length > 0 ? (
                  savedRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe}
                      onUnsave={() => handleUnsaveRecipe(recipe.id)}
                      showUnsaveButton
                    />
                  ))
                ) : (
                  <p className="col-span-3 text-center text-gray-600">
                    You haven't saved any recipes yet.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 