'use client';

import { useState } from 'react';
import { recipeService } from '@/services/recipeService';
import { RecipeCard } from '@/components/RecipeCard';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';

export default function CreateRecipe() {
  const [recipe, setRecipe] = useState({
    name: '',
    temperature: '',
    cooking_time: '',
    yield: '',
    notes: '',
    isPublic: true
  });

  const [ingredients, setIngredients] = useState([
    { amount: '', ingredient: '' }
  ]);

  const [instructions, setInstructions] = useState([
    { instruction: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const previewRecipe = {
    id: 0, // Temporary ID for preview
    name: recipe.name,
    temperature: recipe.temperature ? parseInt(recipe.temperature) : undefined,
    cooking_time: recipe.cooking_time,
    yield: recipe.yield,
    notes: recipe.notes,
    created_at: new Date().toISOString(),
    isPublic: recipe.isPublic,
    ingredients: ingredients.map((ing, id) => ({ ...ing, id })),
    instructions: instructions.map((inst, index) => ({
      ...inst,
      id: index,
      step_number: index + 1
    }))
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { amount: '', ingredient: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (index: number, field: 'amount' | 'ingredient', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, { instruction: '' }]);
  };

  const handleRemoveInstruction = (index: number) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter((_, i) => i !== index));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = { instruction: value };
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await recipeService.createRecipe(
        {
          ...recipe,
          temperature: recipe.temperature ? parseInt(recipe.temperature) : undefined
        },
        ingredients,
        instructions.map((inst, index) => ({
          ...inst,
          step_number: index + 1
        }))
      );

      // Reset form
      setRecipe({
        name: '',
        temperature: '',
        cooking_time: '',
        yield: '',
        notes: '',
        isPublic: true
      });
      setIngredients([{ amount: '', ingredient: '' }]);
      setInstructions([{ instruction: '' }]);
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);

    try {
      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);

      // Upload to Supabase
      const url = await recipeService.uploadImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Create New Recipe</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Recipe Details Section */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Recipe Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Recipe Name</label>
                <input
                  type="text"
                  value={recipe.name}
                  onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Temperature (°F)</label>
                  <input
                    type="number"
                    value={recipe.temperature}
                    onChange={(e) => setRecipe({ ...recipe, temperature: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Cooking Time</label>
                  <input
                    type="text"
                    value={recipe.cooking_time}
                    onChange={(e) => setRecipe({ ...recipe, cooking_time: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Yield</label>
                  <input
                    type="text"
                    value={recipe.yield}
                    onChange={(e) => setRecipe({ ...recipe, yield: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={recipe.notes}
                  onChange={(e) => setRecipe({ ...recipe, notes: e.target.value })}
                  className="w-full p-2 border rounded-md h-24"
                />
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Ingredients</h2>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 
                         transition-colors flex items-center gap-2"
              >
                <span>Add Ingredient</span> +
              </button>
            </div>
            
            <div className="space-y-4">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-1/3">
                    <input
                      type="text"
                      value={ing.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      placeholder="Amount"
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <IngredientAutocomplete
                      value={ing.ingredient}
                      onChange={(value) => handleIngredientChange(index, 'ingredient', value)}
                      placeholder="Enter ingredient name"
                      required
                    />
                  </div>
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Instructions</h2>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 
                         transition-colors flex items-center gap-2"
              >
                <span>Add Step</span> +
              </button>
            </div>
            
            <div className="space-y-4">
              {instructions.map((inst, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <span className="text-gray-500 mt-2">Step {index + 1}</span>
                  <div className="flex-1">
                    <textarea
                      value={inst.instruction}
                      onChange={(e) => handleInstructionChange(index, e.target.value)}
                      placeholder={`Enter step ${index + 1} instructions`}
                      className="w-full p-2 border rounded-md"
                      rows={2}
                      required
                    />
                  </div>
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Share Settings */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Share Settings</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recipe.isPublic}
                onChange={(e) => setRecipe({ ...recipe, isPublic: e.target.checked })}
                className="w-5 h-5 text-orange-500 rounded"
              />
              <span className="text-gray-700">Share this recipe with the community</span>
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Recipe Image</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="recipe-image"
                  disabled={uploading}
                />
                <label
                  htmlFor="recipe-image"
                  className="block w-full p-2 border-2 border-dashed border-gray-300 rounded-lg
                           hover:border-orange-500 cursor-pointer text-center"
                >
                  {uploading ? 'Uploading...' : 'Click to upload image'}
                </label>
              </div>
              {imagePreview && (
                <div className="w-24 h-24 relative">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageUrl('');
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6
                             flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              disabled={!recipe.name || ingredients[0].ingredient === '' || instructions[0].instruction === ''}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg 
                       hover:bg-gray-200 transition-all transform hover:scale-105 
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Preview Recipe
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg 
                       hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Creating Recipe...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>

      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recipe Preview</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <RecipeCard recipe={previewRecipe} />
          </div>
        </div>
      )}
    </div>
  );
} 