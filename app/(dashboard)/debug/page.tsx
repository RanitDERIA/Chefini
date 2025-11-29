import { Metadata } from 'next';
import FlavorDebugger from '@/components/ui/FlavorDebugger';

export const metadata: Metadata = {
  title: 'Chefini',
  description: 'Fix culinary mistakes instantly with AI-powered chemistry solutions',
};

export default function DebugPage() {
  return <FlavorDebugger />;
}