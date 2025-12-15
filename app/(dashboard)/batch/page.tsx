'use client';

import { Metadata } from 'next';
import BatchCompiler from '@/components/ui/BatchCompiler';

export default function BatchPage() {
    return (
        <div className="min-h-screen">
            <BatchCompiler />
        </div>
    );
}