import mongoose, { Schema, models, Types } from 'mongoose';

export interface IBatchPlan extends Document {
  batch_title: string;
  total_prep_time: string;
  build_phase: Array<{
    task: string;
    duration: string;
    temp: string;
    why: string;
  }>;
  runtime_phase: Array<{
    day: number;
    title: string;
    time: string;
    instructions: string[];
    macros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
  }>;
  storage_tip: string;
  ingredients: string[];
  days: number;
  cookingLevel: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const BatchPlanSchema = new Schema<IBatchPlan>({
  batch_title: { type: String, required: true },
  total_prep_time: { type: String, required: true },
  build_phase: [{
    task: String,
    duration: String,
    temp: String,
    why: String,
  }],
  runtime_phase: [{
    day: Number,
    title: String,
    time: String,
    instructions: [String],
    macros: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
    },
  }],
  storage_tip: String,
  ingredients: [String],
  days: Number,
  cookingLevel: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BatchPlan = models.BatchPlan || mongoose.model<IBatchPlan>('BatchPlan', BatchPlanSchema);

export default BatchPlan;