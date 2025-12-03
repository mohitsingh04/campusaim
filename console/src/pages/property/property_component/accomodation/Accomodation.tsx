import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../../../types/types";
import AccomodationCreate from "./AccomodationCreate";
import { API } from "../../../../contexts/API";
import {
	Edit,
	Trash2,
	ImageOff,
	ImageMinus,
	ImagePlus,
	MoreVertical,
} from "lucide-react";
import Badge from "../../../../ui/badge/Badge";
import AccomodationEdit from "./AccomodationEdit";

// Import lightbox
import Lightbox from "yet-another-react-lightbox";
import AddAccomodationImages from "./AccomodationImages";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Counter from "yet-another-react-lightbox/plugins/counter";
import AccomodationRemoveImages from "./AccomodationRemoveImages";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

export default function Accomodation({
	property,
}: {
	property: PropertyProps | null;
}) {
	const [accomodation, setAccomodation] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [isEdit, setIsEdit] = useState<any>("");
	const [isAddingImages, setIsAddingImages] = useState("");
	const [isRemoveImages, setIsRemoveImages] = useState<any>("");
	const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

	// Lightbox state
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxImages, setLightboxImages] = useState<{ src: string }[]>([]);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const getAccomdation = useCallback(async () => {
		if (!property?.uniqueId) {
			setLoading(false);
			return;
		}
		try {
			const response = await API.get(`/accomodation/${property?.uniqueId}`);
			if (response.data && response.data.length > 0) {
				setAccomodation(response.data);
			} else {
				setAccomodation([]);
			}
		} catch (error) {
			getErrorResponse(error, true);
			setAccomodation([]);
		} finally {
			setLoading(false);
		}
	}, [property?.uniqueId]);

	useEffect(() => {
		getAccomdation();
	}, [getAccomdation]);

	if (loading) {
		return (
			<div className="text-gray-700 dark:text-gray-200 p-4">Loading...</div>
		);
	}

	if (accomodation.length === 0) {
		return (
			<AccomodationCreate property={property} getAccomdation={getAccomdation} />
		);
	}

	if (isEdit) {
		return (
			<AccomodationEdit
				property={property}
				accomodation={isEdit}
				getAccomdation={getAccomdation}
				setIsEdit={setIsEdit}
			/>
		);
	}

	if (isAddingImages) {
		return (
			<AddAccomodationImages
				accomodation={isAddingImages}
				setAddingMore={setIsAddingImages}
				getAccomodations={getAccomdation}
			/>
		);
	}
	if (isRemoveImages) {
		return (
			<div className="m-4">
				<AccomodationRemoveImages
					accomodation={isRemoveImages}
					images={isRemoveImages?.accomodation_images || []}
					setMode={setIsRemoveImages}
					getAccomodation={getAccomdation}
				/>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6">
			{accomodation?.map((acc) => {
				// Filter webp images only, max 16
				const mediaUrl = import.meta.env.VITE_MEDIA_URL || "";
				const webpImages = (acc?.accomodation_images || [])
					?.filter((img: string) => img?.toLowerCase()?.endsWith(".webp"))
					?.slice(0, 16)
					?.map((img: string) => `${mediaUrl}/${img}`);

				return (
					<div key={acc?._id || Math.random()} className="flex flex-col">
						{/* Card Header */}
						<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--yp-border-primary)]">
							<h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
								{acc?.accomodation_name || "Unnamed Accommodation"}
							</h3>

							<div className="flex gap-2">
								<div className="relative">
									<button
										onClick={() =>
											setDropdownOpen(dropdownOpen === acc._id ? null : acc._id)
										}
										className="p-2 rounded-lg hover:bg-[var(--yp-tertiary)]"
									>
										<MoreVertical className="w-5 h-5 text-[var(--yp-muted)]" />
									</button>

									{dropdownOpen === acc._id && (
										<div className="absolute right-0 mt-2 w-48 bg-[var(--yp-tertiary)] shadow-lg rounded-lg z-20">
											<ul className="py-2 text-xs text-[var(--yp-text-primary)]">
												{(acc?.accomodation_images?.length || 0) < 8 && (
													<li>
														<button
															onClick={() => setIsAddingImages(acc)}
															className="w-full flex items-center gap-2 px-2 py-1 text-sm"
														>
															<ImagePlus className="w-4 h-4 text-green-500" />
															Add Images
														</button>
													</li>
												)}
												{(acc?.accomodation_images?.length || 0) > 0 && (
													<li>
														<button
															onClick={() => setIsRemoveImages(acc)}
															className="w-full flex items-center gap-2 px-2 py-1 text-sm"
														>
															<ImageMinus className="w-4 h-4 text-orange-500" />
															Remove Images
														</button>
													</li>
												)}
												<li>
													<button
														onClick={() => setIsEdit(acc)}
														className="w-full flex items-center gap-2 px-2 py-1 text-sm"
													>
														<Edit className="w-4 h-4 text-blue-500" />
														Edit Accommodation
													</button>
												</li>
												<li>
													<button className="w-full flex items-center gap-2 px-2 py-1 text-sm">
														<Trash2 className="w-4 h-4 text-red-500" />
														Delete
													</button>
												</li>
											</ul>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Card Body */}
						<div className="px-4 py-3 flex-1 space-y-3">
							<ReadMoreLess children={acc?.accomodation_description} />

							{/* Prices */}
							<div className="flex flex-wrap gap-2">
								{acc?.accomodation_price &&
								Object.keys(acc.accomodation_price).length > 0 ? (
									Object.entries(acc.accomodation_price).map(
										([currency, value]) => (
											<Badge
												key={currency}
												label={`${currency}: ${value || "N/A"}`}
												color="green"
											/>
										)
									)
								) : (
									<Badge label="No Price Info" color="gray" />
								)}
							</div>
						</div>

						{/* Card Footer */}
						<div className="px-4 py-3 border-t border-[var(--yp-border-primary)] text-sm text-[var(--yp-text-primary)]">
							{webpImages?.length > 0 ? (
								<div className="grid grid-cols-4 gap-2 mt-4">
									{webpImages?.map((img: string, index: number) => (
										<img
											key={index}
											src={img}
											alt={`accomodation-${index}`}
											className="w-full h-32 object-cover rounded-lg cursor-pointer"
											onClick={() => {
												setLightboxImages(
													webpImages?.map((src: string) => ({ src }))
												);
												setLightboxIndex(index);
												setLightboxOpen(true);
											}}
										/>
									))}
								</div>
							) : (
								<div className="flex items-center justify-center py-6 text-[var(--yp-muted)]">
									<ImageOff className="w-6 h-6 mr-2" />
									No images available
								</div>
							)}
						</div>
					</div>
				);
			})}

			{/* Lightbox Component */}
			<Lightbox
				open={lightboxOpen}
				close={() => setLightboxOpen(false)}
				slides={lightboxImages}
				index={lightboxIndex}
				plugins={[Thumbnails, Zoom, Fullscreen, Slideshow, Counter]}
				on={{ view: ({ index }) => setLightboxIndex(index) }}
			/>
		</div>
	);
}
