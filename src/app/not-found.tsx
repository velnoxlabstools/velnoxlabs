import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-[var(--text-main)] mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-[var(--text-muted)] mb-4">Page Not Found</h2>
      <p className="text-[var(--text-muted)] mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}
