import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Trash2, ChevronDown, Edit2 } from "lucide-react";
import QnACreate from "./QnACreate";
import QnAEdit from "./QnAEdit";
import { QnAProps, PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";
import TableButton from "../../../../ui/button/TableButton";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

export default function QnA({ property }: { property: PropertyProps | null }) {
	const [qnas, setQnas] = useState<QnAProps[]>([]);
	const [openId, setOpenId] = useState<string | null>(null);
	const [isEdit, setIsEdit] = useState<QnAProps | null>(null);

	const getQnA = useCallback(async () => {
		if (!property?._id) return;
		try {
			const response = await API.get(`/property/qna/${property?._id}`);
			setQnas(response.data);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, [property?._id]);

	useEffect(() => {
		getQnA();
	}, [getQnA]);

	const handleDelete = async (id: string) => {
		const result = await Swal.fire({
			title: "Are you sure?",
			text: "You won't be able to revert this!",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes, delete it!",
		});

		if (result.isConfirmed) {
			try {
				const response = await API.delete(`/qna/${id}`);
				toast.success(response.data.message);
				await getQnA();
			} catch (error) {
				getErrorResponse(error);
			}
		}
	};

	return (
		<div className="p-3 sm:p-0">
			{isEdit ? (
				<QnAEdit
					isEdit={isEdit}
					onEditSuccess={async () => {
						await getQnA();
						setIsEdit(null);
					}}
					setIsEdit={setIsEdit}
				/>
			) : (
				<>
					<QnACreate onAddSuccess={getQnA} property={property} />

					{qnas.length > 0 ? (
						<div className="p-1 sm:p-6">
							<h3 className="text-base sm:text-lg font-semibold mb-4 text-[var(--yp-text-primary)]">
								QNA List
							</h3>
							<div className="space-y-3">
								{qnas.map((qna) => (
									<div
										key={qna._id}
										className="bg-[var(--yp-secondary)] rounded-lg"
									>
										<button
											className="w-full flex justify-between items-center px-3 sm:px-4 py-3   rounded-t-lg transition"
											onClick={() =>
												setOpenId(openId === qna._id ? null : qna._id)
											}
										>
											<span className="font-medium text-[var(--yp-text-primary)] text-sm sm:text-base">
												{qna.question}
											</span>
											<ChevronDown
												className={`w-4 h-4 sm:w-5 sm:h-5 text-[var(--yp-muted)] transition-transform ${
													openId === qna._id ? "rotate-180" : ""
												}`}
											/>
										</button>

										{openId === qna._id && (
											<div className="p-3 sm:p-4 space-y-3 bg-[var(--yp-tertiary)] rounded-b-lg">
												<ReadMoreLess children={qna.answer} />
												<div className="flex justify-end gap-2 mt-3">
													<TableButton
														color="green"
														Icon={Edit2}
														onClick={() => setIsEdit(qna)}
													/>
													<TableButton
														color="red"
														Icon={Trash2}
														onClick={() => handleDelete(qna._id)}
													/>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center m-4 justify-center py-10 bg-[var(--yp-secondary)] rounded-lg border border-dashed border-[var(--yp-border-primary)] mt-4">
							<p className="text-[var(--yp-muted)] text-center text-sm sm:text-base">
								No Qna have been added yet. Click{" "}
								<span className="font-medium">"Add Qna"</span> to create your
								first Qna and help users find answers quickly!
							</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
