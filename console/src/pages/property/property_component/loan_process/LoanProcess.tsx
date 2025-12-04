import { useCallback, useEffect, useState } from "react";
import { PropertyProps } from "../../../../types/types";
import LoanProcessCreate from "./LoanProcessCreate";
import LoanProcessEdit from "./LoanProcessEdit";
import { API } from "../../../../contexts/API";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

export default function LoanProcess({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [loan_process, setLoanProcess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState<any>("");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const getLoanProcess = useCallback(async () => {
    if (!property?._id) {
      setLoading(false);
      return;
    }
    try {
      const response = await API.get(`/loan_process/${property?._id}`);
      if (response.data && response.data.length > 0) {
        setLoanProcess(response.data);
      } else {
        setLoanProcess([]);
      }
    } catch (error) {
      getErrorResponse(error, true);
      setLoanProcess([]);
    } finally {
      setLoading(false);
    }
  }, [property?._id]);

  useEffect(() => {
    getLoanProcess();
  }, [getLoanProcess]);

  if (loading) {
    return (
      <div className="text-gray-700 dark:text-gray-200 p-4">Loading...</div>
    );
  }

  if (loan_process.length === 0) {
    return (
      <LoanProcessCreate property={property} getLoanProcess={getLoanProcess} />
    );
  }

  if (isEdit) {
    return (
      <LoanProcessEdit
        property={property}
        loan_process={isEdit}
        getLoanProcess={getLoanProcess}
        setIsEdit={setIsEdit}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {loan_process?.map((acc) => {
        return (
          <div key={acc?._id || Math.random()} className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--yp-border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--yp-text-primary)]">
                Loan Process Details
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
              <ReadMoreLess children={acc?.loan_process} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
