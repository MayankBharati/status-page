import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="text-center max-w-md mx-auto p-6">
        <FileQuestion className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Page not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/">
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 