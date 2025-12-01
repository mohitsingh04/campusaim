import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function LeftSidebarSkeleton() {
	return (
		<div className="sticky top-24 space-y-6">
			{/* BOX 1 */}
			<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
				<div className="space-y-2">
					<Skeleton height={36} borderRadius={8} />
					<Skeleton height={36} borderRadius={8} />
					<Skeleton height={36} borderRadius={8} />
				</div>
			</div>

			{/* BOX 2 */}
			<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
				<Skeleton height={20} width={120} borderRadius={8} className="mb-4" />

				<div className="space-y-2">
					<Skeleton height={32} borderRadius={8} />
					<Skeleton height={32} borderRadius={8} />
					<Skeleton height={32} borderRadius={8} />
				</div>
			</div>
		</div>
	);
}
