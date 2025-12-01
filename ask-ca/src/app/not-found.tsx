// src/app/not-found.tsx (or .js)
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function NotFound() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 text-center px-4">
			<div className="max-w-md">
				<TriangleAlert className="mx-auto h-16 w-16 text-yellow-500" />
				<h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
					404 - Page Not Found
				</h1>
				<p className="mt-4 text-base text-gray-500">
					Sorry, we couldn&apos;t find the page you’re looking for. It might
					have been moved, deleted, or you may have mistyped the URL.
				</p>
				<div className="mt-8">
					<Link
						href="/"
						className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Go back home
					</Link>
				</div>
			</div>
		</div>
	);
}
