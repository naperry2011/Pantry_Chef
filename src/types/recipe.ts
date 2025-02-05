export interface Recipe {
  id: number;
  name: string;
  temperature?: number;
  cooking_time: string;
  yield: string;
  notes?: string;
  created_at: string;
  isPublic: boolean;
  user_id?: string;
  image_url?: string;
}

export interface Ingredient {
  id: number;
  amount: string;
  ingredient: string;
  recipe_id?: number;
}

export interface Instruction {
  id: number;
  instruction: string;
  step_number: number;
  recipe_id?: number;
} 