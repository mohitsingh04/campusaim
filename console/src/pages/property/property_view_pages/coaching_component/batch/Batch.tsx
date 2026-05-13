import { useCallback, useEffect, useState } from "react";
import CreateBatch from "./CreateBatch";
import { Edit2, Trash2, Clock, Users, Award, Presentation } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import EditBatch from "./EditBatch";
import { PropertyProps } from "../../../../../types/types";
import { API } from "../../../../../contexts/API";
import {
  getErrorResponse,
  getStatusColor,
  to12Hour,
} from "../../../../../contexts/Callbacks";
import { Badge } from "../../../../../ui/badge/Badge";
import { BiRupee } from "react-icons/bi";

interface BatchItem {
  _id: string;
  batch_name: string;
  batch_size: number;
  batch_start_time: string;
  batch_end_time: string;
  price: number;
  included: string[];
  certificate: boolean;
  certificate_after?: number;
  demo_class?: number;
  status: string;
}

export default function Batch({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);

  const fetchBatches = useCallback(async () => {
    if (!property?._id) return;
    try {
      const res = await API.get(`/batch/property/${property._id}`);
      setBatches((res?.data as BatchItem[]) || []);
    } catch (error) {
      getErrorResponse(error);
    }
  }, [property?._id]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Once deleted, you will not be able to recover this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          await API.delete(`/batch/delete/${id}`);
          toast.success("Batch deleted successfully");
          fetchBatches();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [fetchBatches],
  );

  if (showCreate) {
    return (
      <CreateBatch
        property={property}
        onSave={fetchBatches}
        cancel={() => setShowCreate(false)}
      />
    );
  }

  if (editingBatch) {
    return (
      <EditBatch
        onSave={fetchBatches}
        batch={editingBatch}
        cancel={() => setEditingBatch(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center border-b border-[var(--yp-border-primary)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--yp-text-primary)]">
            Property Batches
          </h2>
          <p className="text-sm text-[var(--yp-text-secondary)]">
            Detailed overview of all property schedules
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
        >
          Create Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.length > 0 ? (
          batches.map((batch) => (
            <div
              key={batch._id}
              className="flex flex-col p-5 rounded-2xl bg-[var(--yp-secondary)] shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge
                    label={batch?.status}
                    color={getStatusColor(batch?.status)}
                  />
                  <h3 className="font-bold text-lg mt-2 text-[var(--yp-text-primary)] leading-tight">
                    {batch.batch_name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBatch(batch)}
                    className="p-2 text-[var(--yp-text-secondary)] hover:bg-[var(--yp-blue-subtle)] hover:text-[var(--yp-blue)] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(batch._id)}
                    className="p-2 text-[var(--yp-text-secondary)] hover:bg-[var(--yp-danger-subtle)] hover:text-[var(--yp-danger)] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-[var(--yp-text-secondary)]">
                  <Clock className="w-4 h-4 text-[var(--yp-main)]" />
                  <span>
                    {to12Hour(batch.batch_start_time)} -{" "}
                    {to12Hour(batch.batch_end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--yp-text-secondary)]">
                  <Users className="w-4 h-4 text-[var(--yp-main)]" />
                  <span>Max: {batch.batch_size}</span>
                </div>
                {batch.certificate && (
                  <div className="flex items-center gap-2 text-sm text-[var(--yp-text-secondary)]">
                    <Award className="w-4 h-4 text-[var(--yp-main)]" />
                    <span>Cert. after {batch.certificate_after}d</span>
                  </div>
                )}
                {batch.demo_class && (
                  <div className="flex items-center gap-2 text-sm text-[var(--yp-text-secondary)]">
                    <Presentation className="w-4 h-4 text-[var(--yp-main)]" />
                    <span>Demo: {batch.demo_class}m</span>
                  </div>
                )}
                {batch.price && (
                  <div className="flex items-center gap-2 text-sm text-[var(--yp-text-secondary)]">
                    <BiRupee className="w-4 h-4 text-[var(--yp-main)]" />
                    <span>Price: {batch.price} Rupee</span>
                  </div>
                )}
              </div>

              {batch.included?.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-[var(--yp-text-secondary)] uppercase mb-2">
                    What's Included
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {batch.included.map((item, i) => (
                      <Badge label={item} key={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-[var(--yp-border-primary)] rounded-3xl bg-[var(--yp-input-primary)]">
            <p className="text-[var(--yp-text-secondary)] font-medium mb-2">
              No active batches found for this property.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] disabled:opacity-50"
            >
              Click here to add one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
