import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ShoppingList from '@/models/ShoppingList';

// GET - Fetch shopping list
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🛒 Fetching shopping list for user:', session.user.id);

    await dbConnect();
    let list = await ShoppingList.findOne({ userId: session.user.id });

    if (!list) {
      console.log('📝 Creating new shopping list');
      list = await ShoppingList.create({ userId: session.user.id, items: [] });
    }

    console.log(`✅ Shopping list found with ${list.items.length} items`);
    return NextResponse.json({ items: list.items });
  } catch (error: any) {
    console.error('❌ GET shopping list error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add item
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { item } = await req.json();

    if (!item || typeof item !== 'string') {
      console.error('❌ Invalid item:', item);
      return NextResponse.json({ error: 'Valid item required' }, { status: 400 });
    }

    console.log('➕ Adding item to shopping list:', item);

    await dbConnect();
    const list = await ShoppingList.findOneAndUpdate(
      { userId: session.user.id },
      { $addToSet: { items: item }, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    console.log('✅ Item added');
    return NextResponse.json({ items: list.items });
  } catch (error: any) {
    console.error('❌ POST shopping list error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove item
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      console.error('❌ Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const item = searchParams.get('item');

    if (!item) {
      console.error('❌ No item specified');
      return NextResponse.json({ error: 'Item parameter required' }, { status: 400 });
    }

    console.log('➖ Removing item from shopping list:', item);

    await dbConnect();
    const list = await ShoppingList.findOneAndUpdate(
      { userId: session.user.id },
      { $pull: { items: item }, updatedAt: new Date() },
      { new: true }
    );

    console.log('✅ Item removed');
    return NextResponse.json({ items: list?.items || [] });
  } catch (error: any) {
    console.error('❌ DELETE shopping list error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}