import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RetreatProps,
  PropertyProps,
  ReqKoItem,
} from "../../../../types/types";
import { API } from "../../../../contexts/API";
import Badge from "../../../../ui/badge/Badge";
import {
  getErrorResponse,
  getStatusColor,
} from "../../../../contexts/Callbacks";
import TableButton from "../../../../ui/button/TableButton";
import { Edit, Eye, Trash } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import AddRetreatForm from "./AddRetreatForm";
import EditRetreatForm from "./EditRetreatForm";
import RetreatView from "./RetreatView";
import { Column, SimpleTable } from "../../../../ui/tables/SimpleTable";

export default function RetreatList({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [allRetreats, setAllRetreats] = useState<RetreatProps[]>([]);
  const [allPropertyRetreat, setAllPropertyRetreat] = useState<any[]>([]);
  const [isViewing, setIsViewing] = useState<RetreatProps | null>(null);
  const [isEditing, setIsEditing] = useState<RetreatProps | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [requirements, setRequirements] = useState<ReqKoItem[]>([]);
  const [keyOutcomes, setKeyOutcomes] = useState<ReqKoItem[]>([]);

  // Fetch requirements
  const fetchRequirements = useCallback(async () => {
    try {
      const res = await API.get("/requirment/all");
      setRequirements(res?.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  // Fetch key outcomes
  const fetchKeyOutcomes = useCallback(async () => {
    try {
      const res = await API.get("/key-outcome/all");
      setKeyOutcomes(res?.data || []);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    fetchRequirements();
    fetchKeyOutcomes();
  }, [fetchRequirements, fetchKeyOutcomes]);

  // Fetch all retreats
  const getAllRetreat = useCallback(async () => {
    try {
      const response = await API.get("/retreat");
      setAllRetreats(response.data.filter((r: RetreatProps) => !r.isDeleted));
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getAllRetreat();
  }, [getAllRetreat]);

  // Fetch property-specific retreats
  const getAllPropertyRetreat = useCallback(async () => {
    if (!property?._id) return;
    try {
      const response = await API.get(
        `/property/property-retreat/${property?._id}`
      );
      setAllPropertyRetreat(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?._id]);

  useEffect(() => {
    getAllPropertyRetreat();
  }, [getAllPropertyRetreat]);

  // Get master retreat by ID
  const getRetreatById = (id: string | number) => {
    return allRetreats.find((item) => String(item._id) === String(id));
  };

  // Delete retreat
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
          const response = await API.delete(`/property-retreat/${id}`);
          toast.success(response.data.message || "Deleted successfully");
          getAllPropertyRetreat();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
    [getAllPropertyRetreat]
  );

  // Merge property and master retreats for table
  const mergedRetreats = allPropertyRetreat.map((retreat) => {
    const master = getRetreatById(retreat?.retreat_id);
    return {
      ...master,
      ...retreat, // property-specific overrides
    };
  });

  // Columns for SimpleTable
  const columns = useMemo<Column<RetreatProps>[]>(
    () => [
      { value: "retreat_name" as keyof RetreatProps, label: "Name" },
      {
        value: "retreat_short_name" as keyof RetreatProps,
        label: "Short Name",
      },
      {
        label: "Status",
        value: (row) => (
          <Badge label={row.status} color={getStatusColor(row.status)} />
        ),
      },
      {
        label: "Actions",
        value: (row) => (
          <div className="flex gap-2">
            <TableButton
              Icon={Eye}
              color="blue"
              buttontype="button"
              onClick={() => setIsViewing(row)}
            />
            <TableButton
              Icon={Edit}
              color="green"
              buttontype="button"
              onClick={() => setIsEditing(row)}
            />
            <TableButton
              Icon={Trash}
              color="red"
              buttontype="button"
              onClick={() => handleDelete(row._id)}
            />
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  // Render add/edit/view
  if (isAdding) {
    return (
      <div className="m-4">
        <AddRetreatForm
          allRetreats={allRetreats}
          property={property}
          onsubmit={getAllPropertyRetreat}
          setIsAdding={setIsAdding}
          requirements={requirements}
          keyoutcomes={keyOutcomes}
        />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="m-4">
        <EditRetreatForm
          retreatToEdit={isEditing}
          onUpdate={getAllPropertyRetreat}
          setIsEditing={setIsEditing}
          getRetreatById={getRetreatById}
          requirements={requirements}
          keyoutcomes={keyOutcomes}
        />
      </div>
    );
  }

  if (isViewing) {
    return (
      <div className="m-4">
        <RetreatView
          retreat={isViewing}
          getRetreatById={getRetreatById}
          setIsViewing={setIsViewing}
          requirements={requirements}
          keyoutcomes={keyOutcomes}
        />
      </div>
    );
  }

  // Render table
  return (
    <div className="m-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[var(--yp-text-primary)]">
          Retreats
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1 text-sm font-medium rounded-md bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] hover:opacity-90 transition"
        >
          + Add Retreat
        </button>
      </div>

      <SimpleTable<RetreatProps> data={mergedRetreats} columns={columns} />
    </div>
  );
}
