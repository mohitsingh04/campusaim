import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../../../types/types";
import AnnouncementCreate from "./AnnouncementCreate";
import AnnouncementEdit from "./AnnouncementEdit";
import { API } from "../../../../contexts/API";
import { Edit, Trash2 } from "lucide-react";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";
import ActionDropdown from "../../../../common/ActionDropdown";

export default function Announcement({
	property,
}: {
	property: PropertyProps | null;
}) {
	const [announcement, setAnnouncement] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isEdit, setIsEdit] = useState<any>("");

	const getAnnouncement = useCallback(async () => {
		if (!property?._id) {
			setLoading(false);
			return;
		}
		try {
			const response = await API.get(`/announcement/${property?._id}`);
			if (response.data && response.data.length > 0) {
				setAnnouncement(response.data);
			} else {
				setAnnouncement([]);
			}
		} catch (error) {
			getErrorResponse(error, true);
			setAnnouncement([]);
		} finally {
			setLoading(false);
		}
	}, [property?._id]);

	useEffect(() => {
		getAnnouncement();
	}, [getAnnouncement]);

	if (loading) {
		return (
			<div className="text-gray-700 dark:text-gray-200 p-4">Loading...</div>
		);
	}

	if (announcement.length === 0) {
		return (
			<AnnouncementCreate
				property={property}
				getAnnouncement={getAnnouncement}
			/>
		);
	}

	if (isEdit) {
		return (
			<AnnouncementEdit
				property={property}
				announcement={isEdit}
				getAnnouncement={getAnnouncement}
				setIsEdit={setIsEdit}
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6">
			{announcement?.map((acc) => {
				return (
					<div key={acc?._id || Math.random()} className="flex flex-col">
						<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--yp-border-primary)]">
							<h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
								Announcement Details
							</h3>

							<div className="flex gap-2">
								<ActionDropdown>
									<ul className="py-2 text-xs text-[var(--yp-text-primary)]">
										<li>
											<button
												onClick={() => setIsEdit(acc)}
												className="w-full flex items-center gap-2 px-2 py-1 text-sm"
											>
												<Edit className="w-4 h-4 text-blue-500" />
												Edit Announcement
											</button>
										</li>
										<li>
											<button
												onClick={() => {
													// delete logic
												}}
												className="w-full flex items-center gap-2 px-2 py-1 text-sm"
											>
												<Trash2 className="w-4 h-4 text-red-500" />
												Delete
											</button>
										</li>
									</ul>
								</ActionDropdown>
							</div>
						</div>
						{/* Card Body */}
						<div className="px-4 py-3 flex-1 space-y-3">
							<ReadMoreLess children={acc?.announcement} />
						</div>
					</div>
				);
			})}
		</div>
	);
}
