import { useState, useMemo, useCallback, useEffect } from "react";
import { Eye } from "lucide-react";
import {
  PropertyProps,
  type Column,
  type EnquiryProps,
} from "../../../../types/types";
import Badge from "../../../../ui/badge/Badge";
import TableButton from "../../../../ui/button/TableButton";
import { API } from "../../../../contexts/API";
import {
  getErrorResponse,
  getStatusColor,
} from "../../../../contexts/Callbacks";
import EnquiryView from "./EnquiryView";
import { SimpleTable } from "../../../../ui/tables/SimpleTable";

export function Enquiry({ property }: { property: PropertyProps | null }) {
  const [users, setUsers] = useState<EnquiryProps[]>([]);
  const [isView, setIsViewing] = useState<EnquiryProps | null>(null);

  const getAllUsers = useCallback(async () => {
    if (!property?._id) return;
    try {
      const response = await API.get(`/property/enquiry/${property?._id}`);
      setUsers(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?._id]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const columns = useMemo<Column<EnquiryProps>[]>(
    () => [
      { value: "name" as keyof EnquiryProps, label: "Name" },
      { value: "email" as keyof EnquiryProps, label: "Email" },
      {
        value: (row: EnquiryProps) => (
          <Badge label={row.status} color={getStatusColor(row?.status)} />
        ),
        label: "Status",
      },
      {
        label: "Actions",
        value: (row: EnquiryProps) => (
          <div className="flex space-x-2">
            <TableButton
              Icon={Eye}
              color="blue"
              size="sm"
              onClick={() => setIsViewing(row)}
            />
          </div>
        ),
      },
    ],
    []
  );

  if (isView) {
    return <EnquiryView enquiry={isView} />;
  }

  return (
    <div className="space-y-6 p-4">
      <SimpleTable<EnquiryProps> data={users} columns={columns} />
    </div>
  );
}
