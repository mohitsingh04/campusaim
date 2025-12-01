import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Trash2, ChevronDown, Edit2 } from "lucide-react";
import AddFaq from "./AddFaqs";
import EditFaq from "./EditFaqs";
import { FAQProps, PropertyProps } from "../../../../types/types";
import { API } from "../../../../contexts/API";
import TableButton from "../../../../ui/button/TableButton";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

export default function Faqs({ property }: { property: PropertyProps | null }) {
  const [faqs, setFaqs] = useState<FAQProps[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [isEdit, setIsEdit] = useState<FAQProps | null>(null);

  const getFaqs = useCallback(async () => {
    if (!property?.uniqueId) return;
    try {
      const response = await API.get(`/property/faq/${property?.uniqueId}`);
      setFaqs(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?.uniqueId]);

  useEffect(() => {
    getFaqs();
  }, [getFaqs]);

  const handleDelete = async (id: number) => {
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
        const response = await API.delete(`/faqs/${id}`);
        toast.success(response.data.message);
        await getFaqs();
      } catch (error) {
        getErrorResponse(error);
      }
    }
  };

  return (
    <div className="p-3 sm:p-0">
      {isEdit ? (
        <EditFaq
          isEdit={isEdit}
          onEditSuccess={async () => {
            await getFaqs();
            setIsEdit(null);
          }}
          setIsEdit={setIsEdit}
        />
      ) : (
        <>
          <AddFaq onAddSuccess={getFaqs} property={property} />

          {faqs.length > 0 ? (
            <div className="p-1 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-[var(--yp-text-primary)]">
                FAQ List
              </h3>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.uniqueId}
                    className="bg-[var(--yp-secondary)] rounded-lg"
                  >
                    <button
                      className="w-full flex justify-between items-center px-3 sm:px-4 py-3   rounded-t-lg transition"
                      onClick={() =>
                        setOpenId(openId === faq.uniqueId ? null : faq.uniqueId)
                      }
                    >
                      <span className="font-medium text-[var(--yp-text-primary)] text-sm sm:text-base">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-[var(--yp-muted)] transition-transform ${
                          openId === faq.uniqueId ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openId === faq.uniqueId && (
                      <div className="p-3 sm:p-4 space-y-3 bg-[var(--yp-tertiary)] rounded-b-lg">
                        <ReadMoreLess children={faq.answer} />
                        <div className="flex justify-end gap-2 mt-3">
                          <TableButton
                            color="green"
                            Icon={Edit2}
                            onClick={() => setIsEdit(faq)}
                          />
                          <TableButton
                            color="red"
                            Icon={Trash2}
                            onClick={() => handleDelete(faq.uniqueId)}
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
                No FAQs have been added yet. Click{" "}
                <span className="font-medium">"Add FAQ"</span> to create your
                first FAQ and help users find answers quickly!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
