import { Column, SimpleTable } from "../../../../ui/tables/SimpleTable";

export default function PermissionList({
  setIsAdding,
  allPermissions,
}: {
  setIsAdding: any;
  allPermissions: { _id: string; title: string }[];
}) {
  const columns: Column<{ _id: string; title: string }>[] = [
    { label: "Title", value: "title" },
    {
      label: "Action",
      value: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(row)}
            className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-[var(--yp-primary)] rounded-xl shadow-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)]">
          Permissions
        </h2>
        <button
          onClick={() => setIsAdding("true")}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          + Add Permission
        </button>
      </div>
      <SimpleTable data={allPermissions} columns={columns} />
    </div>
  );
}
