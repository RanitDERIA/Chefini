import mongoose, { Schema, models, Types } from 'mongoose';

export interface IShoppingList extends Document {
  userId: Types.ObjectId;
  items: string[];
  updatedAt: Date;
}

const ShoppingListSchema = new Schema<IShoppingList>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [String],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ShoppingList = models.ShoppingList || mongoose.model<IShoppingList>('ShoppingList', ShoppingListSchema);

export default ShoppingList;