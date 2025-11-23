import mongoose, { Schema, models, Types } from 'mongoose';

export interface IIngredient {
  item: string;
  missing?: boolean;
}

export interface IMacros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface IRecipe extends Document {
  title: string;
  ingredients: IIngredient[];
  instructions: string[];
  macros: IMacros;
  tip: string;
  time: string;
  createdBy: Types.ObjectId;
  isPublic: boolean;
  likes: number;
  createdAt: Date;
}

const RecipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: true,
  },
  ingredients: [{
    item: String,
    missing: { type: Boolean, default: false }
  }],
  instructions: [String],
  macros: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  tip: String,
  time: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recipe = models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export default Recipe;