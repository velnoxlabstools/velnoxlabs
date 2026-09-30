import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-slate-300 mb-4">Page Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium">
        Back to Home
      </Link>
    </div>
  );
}