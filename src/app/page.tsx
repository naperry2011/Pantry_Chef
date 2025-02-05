'use client';

import { useEffect, useState } from 'react';
import { Recipe, Ingredient, Instruction } from '@/types/recipe';
import { recipeService } from '@/services/recipeService';

type RecipeWithRelations = Recipe & {
  ingredients: Ingredient[];
  instructions: Instruction[];
  matchCount?: number;
  matchPercentage?: number;
};

export default function Home() {
  const [exactMatches, setExactMatches] = useState<RecipeWithRelations[]>([]);
  const [relatedMatches, setRelatedMatches] = useState<RecipeWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchIngredient, setSearchIngredient] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [allExactMatches, setAllExactMatches] = useState<RecipeWithRelations[]>([]);
  const [allRelatedMatches, setAllRelatedMatches] = useState<RecipeWithRelations[]>([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [savedRecipeIds, setSavedRecipeIds] = useState<number[]>([]);
  const mockUserId = 'user123'; // TODO: Replace with actual user ID from authentication
  
  const RECIPES_PER_PAGE = 3;
  const RECIPES_PER_SET = 3;

  useEffect(() => {
    // Load saved recipe IDs when the component mounts
    async function loadSavedRecipes() {
      try {
        const saved = await recipeService.getSavedRecipes(mockUserId);
        setSavedRecipeIds(saved.map(recipe => recipe.id));
      } catch (error) {
        console.error('Error loading saved recipes:', error);
      }
    }
    loadSavedRecipes();
  }, []);

  const handleAddIngredient = () => {
    const trimmedIngredient = searchIngredient.trim().toLowerCase();
    if (trimmedIngredient && !selectedIngredients.includes(trimmedIngredient)) {
      setSelectedIngredients([...selectedIngredients, trimmedIngredient]);
      setSearchIngredient('');
      // Automatically search when an ingredient is added
      handleSearch([...selectedIngredients, trimmedIngredient]);
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    const updatedIngredients = selectedIngredients.filter(ing => ing !== ingredient);
    setSelectedIngredients(updatedIngredients);
    // Automatically search when an ingredient is removed
    if (updatedIngredients.length > 0) {
      handleSearch(updatedIngredients);
    } else {
      setExactMatches([]);
      setRelatedMatches([]);
    }
  };

  const handleSearch = async (ingredients: string[] = selectedIngredients) => {
    if (ingredients.length === 0) {
      setExactMatches([]);
      setRelatedMatches([]);
      setAllExactMatches([]);
      setAllRelatedMatches([]);
      setCurrentSet(0);
      return;
    }

    setLoading(true);
    try {
      const { exactMatches: exact, relatedMatches: related } = 
        await recipeService.searchRecipesByIngredients(ingredients);
      
      setAllExactMatches(exact);
      setAllRelatedMatches(related);
      
      // Show first set
      showRecipeSet(0, exact, related);

    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const showRecipeSet = (setNumber: number, exact = allExactMatches, related = allRelatedMatches) => {
    const startIdx = (setNumber * RECIPES_PER_SET) % exact.length;
    const endIdx = startIdx + RECIPES_PER_SET;
    
    // Get next set of exact matches, wrapping around if needed
    const nextExactMatches = [
      ...exact.slice(startIdx, Math.min(endIdx, exact.length)),
      ...exact.slice(0, Math.max(0, endIdx - exact.length))
    ].slice(0, RECIPES_PER_SET);

    // Get next set of related matches, wrapping around if needed
    const relatedStartIdx = (setNumber * RECIPES_PER_SET) % related.length;
    const relatedEndIdx = relatedStartIdx + RECIPES_PER_SET;
    const nextRelatedMatches = [
      ...related.slice(relatedStartIdx, Math.min(relatedEndIdx, related.length)),
      ...related.slice(0, Math.max(0, relatedEndIdx - related.length))
    ].slice(0, RECIPES_PER_SET);

    setExactMatches(nextExactMatches);
    setRelatedMatches(nextRelatedMatches);
    setCurrentSet(setNumber);
  };

  const handleShuffleRecipes = () => {
    showRecipeSet(currentSet + 1);
  };

  const handleSaveRecipe = async (recipeId: number) => {
    try {
      if (!mockUserId) {
        throw new Error('Please log in to save recipes');
      }
      
      // Add loading state if needed
      const savedRecipe = await recipeService.saveRecipe(mockUserId, recipeId);
      if (savedRecipe) {
        setSavedRecipeIds(prev => [...prev, recipeId]);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      // Let the RecipeCard component handle the error toast
      throw error;
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="food-wars-title text-5xl font-extrabold mb-2 text-center tracking-tight">
          Pantry Chef
        </h1>
        <p className="text-center mb-12 text-xl text-gray-600 italic">
          Let's create a dish that suits you! <span className="steam-icon">🍳</span>
        </p>
        
        <div className="mb-12 p-8 bg-white rounded-2xl shadow-xl border-2 border-orange-100">
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchIngredient}
              onChange={(e) => setSearchIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
              placeholder="Enter your ingredients..."
              className="flex-1 p-3 border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <button
              onClick={handleAddIngredient}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 font-semibold shadow-md"
            >
              Add Ingredient
            </button>
          </div>

          {selectedIngredients.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 rounded-full flex items-center gap-2 shadow-sm"
                  >
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-orange-200 hover:bg-orange-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={selectedIngredients.length === 0 || loading}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold text-lg shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                Searching... <span className="steam-icon">🔍</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Find Recipes <span>⚔️</span>
              </span>
            )}
          </button>
        </div>

        {(exactMatches.length > 0 || relatedMatches.length > 0) && (
          <div className="space-y-12">
            {exactMatches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Perfect Matches 🎯
                    <span className="text-sm font-normal ml-2 text-gray-600">
                      (Set {currentSet + 1} of {Math.ceil(allExactMatches.length / RECIPES_PER_SET)})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {exactMatches.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      selectedIngredients={selectedIngredients}
                      showSaveButton={!savedRecipeIds.includes(recipe.id)}
                      onSave={() => handleSaveRecipe(recipe.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {relatedMatches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-800">
                    You Might Also Like 💫
                    <span className="text-sm font-normal ml-2 text-gray-600">
                      (Set {currentSet + 1} of {Math.ceil(allRelatedMatches.length / RECIPES_PER_SET)})
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedMatches.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      selectedIngredients={selectedIngredients}
                      showSaveButton={!savedRecipeIds.includes(recipe.id)}
                      onSave={() => handleSaveRecipe(recipe.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {(allExactMatches.length > RECIPES_PER_SET || allRelatedMatches.length > RECIPES_PER_SET) && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleShuffleRecipes}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg 
                           hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 
                           font-semibold shadow-md flex items-center gap-2"
                >
                  Shuffle Recipes
                  <span className="steam-icon">🔄</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const RecipeCard = ({ 
  recipe, 
  selectedIngredients,
  showSaveButton,
  onSave
}: { 
  recipe: RecipeWithRelations; 
  selectedIngredients: string[];
  showSaveButton: boolean;
  onSave: () => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="recipe-card bg-white rounded-2xl p-6 shadow-xl border-2 border-orange-100 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <h2 className="text-2xl font-bold mb-3 text-gray-800">
          {recipe.name}
          {recipe.matchCount && (
            <span className="ml-2 text-sm text-orange-500">
              ({recipe.matchCount} matching ingredients - 
              {Math.round(recipe.matchPercentage)}% match)
            </span>
          )}
        </h2>
        
        <div className="flex justify-between text-sm text-gray-500 mb-6 bg-orange-50 p-3 rounded-lg">
          <span className="flex items-center gap-1">
            <span className="steam-icon">🕒</span> {recipe.cooking_time}
          </span>
          <span className="flex items-center gap-1">
            <span className="steam-icon">🍳</span> {recipe.yield}
          </span>
          {recipe.temperature && (
            <span className="flex items-center gap-1">
              <span className="steam-icon">🌡️</span> {recipe.temperature}°
            </span>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold mb-3 text-lg text-gray-800 flex items-center gap-2">
            <span className="steam-icon">📝</span> Ingredients:
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {recipe.ingredients.slice(0, 4).map((ing) => (
              <li
                key={ing.id}
                className={`${
                  selectedIngredients.includes(ing.ingredient.toLowerCase())
                    ? 'text-orange-600 font-bold'
                    : 'text-gray-600'
                } transition-colors`}
              >
                {ing.amount} {ing.ingredient}
              </li>
            ))}
            {recipe.ingredients.length > 4 && (
              <li className="text-orange-500 font-semibold">
                +{recipe.ingredients.length - 4} more ingredients...
              </li>
            )}
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg 
                     hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 
                     font-semibold shadow-md flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
          >
            View Full Recipe
            <span className="steam-icon">📖</span>
          </button>

          {showSaveButton && (
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                       transition-all transform hover:scale-105 font-semibold shadow-md 
                       flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
            >
              💾
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {recipe.name}
                {recipe.matchCount && (
                  <span className="ml-2 text-sm text-orange-500">
                    ({recipe.matchCount} matching ingredients - 
                    {Math.round(recipe.matchPercentage)}% match)
                  </span>
                )}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {recipe.notes && (
              <p className="text-gray-600 mb-6 italic">{recipe.notes}</p>
            )}

            <div className="flex justify-between text-sm text-gray-500 mb-6 bg-orange-50 p-4 rounded-lg">
              <span className="flex items-center gap-1">
                <span className="steam-icon">🕒</span> {recipe.cooking_time}
              </span>
              <span className="flex items-center gap-1">
                <span className="steam-icon">🍳</span> {recipe.yield}
              </span>
              {recipe.temperature && (
                <span className="flex items-center gap-1">
                  <span className="steam-icon">🌡️</span> {recipe.temperature}°
                </span>
              )}
            </div>

            <div className="mb-8">
              <h3 className="font-bold mb-4 text-xl text-gray-800 flex items-center gap-2">
                <span className="steam-icon">📝</span> Ingredients:
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li
                    key={ing.id}
                    className={`${
                      selectedIngredients.includes(ing.ingredient.toLowerCase())
                        ? 'text-orange-600 font-bold'
                        : 'text-gray-600'
                    } transition-colors`}
                  >
                    {ing.amount} {ing.ingredient}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4 text-xl text-gray-800 flex items-center gap-2">
                <span className="steam-icon">👨‍🍳</span> Instructions:
              </h3>
              <ol className="list-decimal list-inside space-y-3">
                {recipe.instructions
                  .sort((a, b) => a.step_number - b.step_number)
                  .map((inst) => (
                    <li key={inst.id} className="text-gray-600">
                      {inst.instruction}
                    </li>
                  ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
