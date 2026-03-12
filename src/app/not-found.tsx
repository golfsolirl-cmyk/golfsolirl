import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        404
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="text-[var(--color-accent)] underline focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] rounded"
      >
        Go home
      </Link>
    </div>
  );
}
