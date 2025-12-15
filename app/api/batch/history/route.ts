import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import BatchPlan from '@/models/BatchPlan';

// GET: Fetch all saved batch plans for current user
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const plans = await BatchPlan.find({ createdBy: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            plans
        });
    } catch (error: any) {
        console.error('❌ Batch History Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch batch plans'
        }, { status: 500 });
    }
}

// DELETE: Remove a batch plan
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('id');

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
        }

        await dbConnect();

        const result = await BatchPlan.deleteOne({
            _id: planId,
            createdBy: session.user.id
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Batch plan deleted'
        });
    } catch (error: any) {
        console.error('❌ Delete Error:', error);
        return NextResponse.json({
            error: 'Failed to delete batch plan'
        }, { status: 500 });
    }
}
