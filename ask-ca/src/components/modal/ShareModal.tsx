import { Copy } from "lucide-react";
import toast from "react-hot-toast";

// You can use a custom WhatsApp SVG if lucide-react doesn't have it
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
	<svg
		{...props}
		viewBox="0 0 32 32"
		fill="currentColor"
		className={props.className}
	>
		<path d="M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.47 1.74 6.41L3.2 28.8l6.59-1.72A12.74 12.74 0 0 0 16 28.8c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.8-12.8zm0 23.04c-2.01 0-3.98-.53-5.7-1.54l-.41-.24-3.91 1.02 1.04-3.81-.26-.39A10.57 10.57 0 0 1 5.44 16c0-5.83 4.74-10.56 10.56-10.56 5.83 0 10.56 4.74 10.56 10.56 0 5.83-4.74 10.56-10.56 10.56zm5.8-7.87c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6-.96-.85-1.6-1.89-1.79-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.53-.54-.71-.55-.18-.01-.4-.01-.62-.01-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.65 0 1.56 1.14 3.06 1.3 3.27.16.21 2.24 3.42 5.44 4.66.76.33 1.36.53 1.83.68.77.25 1.47.22 2.02.13.62-.09 1.89-.77 2.16-1.51.27-.74.27-1.37.19-1.51-.08-.14-.29-.22-.61-.38z" />
	</svg>
);

type ShareModalProps = {
	url: string;
	title: string;
	open: boolean;
	onClose: () => void;
};

export default function ShareModal({
	url,
	open,
	onClose,
}: ShareModalProps) {
	const handleCopy = async () => {
		await navigator.clipboard.writeText(url);
		toast.success("Link copied to clipboard!");
	};

	return open ? (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fadeIn">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold text-gray-800">
						Share this question
					</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 text-2xl font-bold cursor-pointer"
						aria-label="Close"
					>
						&times;
					</button>
				</div>
				<div className="flex items-center border rounded-lg px-3 py-2 mb-5 bg-gray-50">
					<input
						className="flex-1 bg-transparent outline-none text-sm text-gray-700"
						value={url}
						readOnly
					/>
					<button
						onClick={handleCopy}
						className="ml-2 p-1 rounded hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition cursor-pointer"
						title="Copy link"
					>
						<Copy className="w-5 h-5" />
					</button>
				</div>
				<div className="grid grid-cols-3 gap-4 mb-2">
					{/* <a
						href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
							url
						)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex flex-col items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
					>
						<Facebook className="w-7 h-7 text-blue-600" />
						<span className="text-xs mt-2 text-gray-700">Facebook</span>
					</a> */}
					{/* <a
						href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
							url
						)}&text=${encodeURIComponent(title)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex flex-col items-center p-3 rounded-lg bg-sky-50 hover:bg-sky-100 transition"
					>
						<Twitter className="w-7 h-7 text-sky-500" />
						<span className="text-xs mt-2 text-gray-700">Twitter</span>
					</a> */}
					{/* <a
						href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
							url
						)}&title=${encodeURIComponent(title)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex flex-col items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
					>
						<Linkedin className="w-7 h-7 text-blue-700" />
						<span className="text-xs mt-2 text-gray-700">LinkedIn</span>
					</a> */}
					<a
						href={`https://wa.me/?text=${encodeURIComponent(url)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex flex-col items-center p-3 rounded-lg bg-green-50 hover:bg-green-100 transition"
					>
						<WhatsAppIcon className="w-7 h-7 text-green-500" />
						<span className="text-xs mt-2 text-gray-700">WhatsApp</span>
					</a>
					{/* <a
						href={`mailto:?subject=${encodeURIComponent(
							title
						)}&body=${encodeURIComponent(url)}`}
						className="flex flex-col items-center p-3 rounded-lg bg-red-50 hover:bg-red-100 transition"
					>
						<Mail className="w-7 h-7 text-red-500" />
						<span className="text-xs mt-2 text-gray-700">Email</span>
					</a> */}
				</div>
			</div>
			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fadeIn {
					animation: fadeIn 0.2s ease;
				}
			`}</style>
		</div>
	) : null;
}
