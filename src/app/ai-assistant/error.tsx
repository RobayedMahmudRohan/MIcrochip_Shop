"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-semibold">
          Something went wrong
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          We could not load the AI assistant. Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}