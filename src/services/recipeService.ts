import { supabase } from '@/lib/supabase';
import { Recipe, Ingredient, Instruction } from '@/types/recipe';

type RecipeWithRelations = Recipe & {
  ingredients: Ingredient[];
  instructions: Instruction[];
  matchCount?: number;
};

export const recipeService = {
  async getAllRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients(*),
        instructions(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Recipe & { ingredients: Ingredient[], instructions: Instruction[] })[];
  },

  async getRecipeById(id: number) {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients(*),
        instructions(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as (Recipe & { ingredients: Ingredient[], instructions: Instruction[] });
  },

  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>, 
                    ingredients: Omit<Ingredient, 'id' | 'recipe_id' | 'created_at'>[],
                    instructions: Omit<Instruction, 'id' | 'recipe_id' | 'created_at'>[]) {
    // Start a transaction
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Insert ingredients
    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .insert(ingredients.map(ing => ({
        ...ing,
        recipe_id: recipeData.id
      })));

    if (ingredientsError) throw ingredientsError;

    // Insert instructions
    const { error: instructionsError } = await supabase
      .from('instructions')
      .insert(instructions.map((inst, index) => ({
        ...inst,
        recipe_id: recipeData.id,
        step_number: index + 1
      })));

    if (instructionsError) throw instructionsError;

    return this.getRecipeById(recipeData.id);
  },

  async updateRecipe(id: string, recipe: Partial<Recipe>) {
    const { data, error } = await supabase
      .from('recipes')
      .update(recipe)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Recipe;
  },

  async deleteRecipe(id: number) {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async searchRecipesByIngredients(ingredients: string[]) {
    if (!ingredients.length) return { exactMatches: [], relatedMatches: [] };

    const lowerIngredients = ingredients.map(ing => ing.toLowerCase().trim());
    console.log('Searching for ingredients:', lowerIngredients);

    try {
      // First get all recipes that have ANY of the searched ingredients
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          id,
          name,
          temperature,
          cooking_time,
          yield,
          notes,
          created_at,
          ingredients!inner (
            id,
            recipe_id,
            amount,
            ingredient
          ),
          instructions (
            id,
            recipe_id,
            step_number,
            instruction
          )
        `)
        .order('created_at', { ascending: false });

      if (recipesError) {
        console.error('Error fetching recipes:', recipesError);
        throw recipesError;
      }

      if (!recipesData) {
        console.log('No recipes found in database');
        return { exactMatches: [], relatedMatches: [] };
      }

      // Process and score each recipe
      const processedRecipes = (recipesData as RecipeWithRelations[]).map(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => 
          ing.ingredient.toLowerCase().trim()
        );

        // Calculate match score based on:
        // 1. Number of matching ingredients
        // 2. Percentage of recipe ingredients that match
        const matchingIngredients = lowerIngredients.filter(searchIng => 
          recipeIngredients.some(recipeIng => recipeIng.includes(searchIng))
        );
        
        const matchCount = matchingIngredients.length;
        const matchPercentage = (matchCount / recipe.ingredients.length) * 100;

        // Combined score that considers both factors
        const score = matchCount + (matchPercentage / 100);

        return {
          ...recipe,
          matchCount,
          matchPercentage,
          score
        };
      });

      // Sort by score descending
      const sortedRecipes = processedRecipes
        .filter(recipe => recipe.matchCount > 0) // Only keep recipes with matches
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      // Get exact matches (recipes that contain all searched ingredients)
      const exactMatches = sortedRecipes
        .filter(recipe => recipe.matchCount === ingredients.length);

      // Get related matches (recipes that contain some ingredients)
      const relatedMatches = sortedRecipes
        .filter(recipe => 
          recipe.matchCount < ingredients.length &&
          !exactMatches.find(exact => exact.id === recipe.id)
        );

      console.log(`Found ${exactMatches.length} exact matches and ${relatedMatches.length} related matches`);

      return {
        exactMatches,
        relatedMatches
      };
    } catch (error) {
      console.error('Error in searchRecipesByIngredients:', error);
      throw error;
    }
  },

  async getUserRecipes(userId: string) {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        ingredients(*),
        instructions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Recipe & { ingredients: Ingredient[], instructions: Instruction[] })[];
  },

  async getSavedRecipes(userId: string) {
    try {
      const { data: savedRecipes, error: savedError } = await supabase
        .from('saved_recipes')
        .select(`
          recipe_id,
          recipe:recipes (
            *,
            ingredients (*),
            instructions (*)
          )
        `)
        .eq('user_id', userId);

      if (savedError) {
        console.error('Error fetching saved recipes:', savedError);
        throw savedError;
      }

      if (!savedRecipes) {
        return [];
      }

      // Map the nested recipe data correctly
      return savedRecipes
        .map(sr => sr.recipe)
        .filter(recipe => recipe !== null) as (Recipe & { 
          ingredients: Ingredient[], 
          instructions: Instruction[] 
        })[];
    } catch (error) {
      console.error('Error in getSavedRecipes:', error);
      throw error;
    }
  },

  async saveRecipe(userId: string, recipeId: number) {
    try {
      // First check if recipe exists
      const { data: recipeExists, error: recipeError } = await supabase
        .from('recipes')
        .select('id')
        .eq('id', recipeId)
        .single();

      if (recipeError || !recipeExists) {
        throw new Error('Recipe not found');
      }

      // Then try to save it
      const { data, error } = await supabase
        .from('saved_recipes')
        .insert([
          { 
            user_id: userId, 
            recipe_id: recipeId 
          }
        ])
        .select('*')
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('Recipe already saved');
        }
        console.error('Error saving recipe:', error);
        throw new Error('Failed to save recipe');
      }

      return data;
    } catch (error) {
      console.error('Error in saveRecipe:', error);
      throw error;
    }
  },

  async isSaved(userId: string, recipeId: number) {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async unsaveRecipe(userId: string, recipeId: number) {
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);

    if (error) throw error;
  },

  async uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `recipe-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('recipes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('recipes')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
}; 