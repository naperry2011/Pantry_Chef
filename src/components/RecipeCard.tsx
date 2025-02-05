'use client';

import { useState } from 'react';
import { Recipe, Ingredient, Instruction } from '@/types/recipe';
import Link from 'next/link';
import toast from 'react-hot-toast';

type RecipeWithRelations = Recipe & {
  ingredients: Ingredient[];
  instructions: Instruction[];
  matchCount?: number;
  matchPercentage?: number;
};

interface RecipeCardProps {
  recipe: RecipeWithRelations;
  selectedIngredients?: string[];
  showEditButton?: boolean;
  showUnsaveButton?: boolean;
  showSaveButton?: boolean;
  onUnsave?: () => void;
  onSave?: () => void;
}

export function RecipeCard({ 
  recipe, 
  selectedIngredients = [], 
  showEditButton,
  showUnsaveButton,
  showSaveButton,
  onUnsave,
  onSave
}: RecipeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnsaving, setIsUnsaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onSave?.();
      toast.success('Recipe saved successfully!', {
        icon: '💾',
        style: {
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          padding: '16px',
          color: '#1F2937',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save recipe';
      toast.error(errorMessage, {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          padding: '16px',
          color: '#991B1B',
        },
      });
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUnsaving(true);
    try {
      await onUnsave?.();
      toast.success('Recipe removed from saved recipes', {
        icon: '🗑️',
        style: {
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          padding: '16px',
          color: '#1F2937',
        },
      });
    } catch (error) {
      toast.error('Failed to remove recipe. Please try again.', {
        icon: '❌',
        style: {
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          padding: '16px',
          color: '#991B1B',
        },
      });
    } finally {
      setIsUnsaving(false);
    }
  };

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
              {Math.round(recipe.matchPercentage || 0)}% match)
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

          {showEditButton && (
            <Link
              href={`/edit/${recipe.id}`}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                       transition-all transform hover:scale-105 font-semibold shadow-md 
                       flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              ✏️
            </Link>
          )}

          {showSaveButton && (
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                       transition-all transform hover:scale-105 font-semibold shadow-md 
                       flex items-center justify-center disabled:opacity-50 
                       disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                '💾'
              )}
            </button>
          )}

          {showUnsaveButton && (
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 
                       transition-all transform hover:scale-105 font-semibold shadow-md 
                       flex items-center justify-center disabled:opacity-50 
                       disabled:cursor-not-allowed"
              onClick={handleUnsave}
              disabled={isUnsaving}
            >
              {isUnsaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Removing...
                </span>
              ) : (
                '❌'
              )}
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
                    {Math.round(recipe.matchPercentage || 0)}% match)
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
} 