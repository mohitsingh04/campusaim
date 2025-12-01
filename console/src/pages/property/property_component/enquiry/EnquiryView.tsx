import { EnquiryProps } from "../../../../types/types";

export default function EnquiryView({
  enquiry,
}: {
  enquiry: EnquiryProps | null;
}) {
  if (!enquiry) return <div>No enquiry found.</div>;

  const excludeFields = ["_id", "createdAt", "__v", "updatedAt", "property_id"];

  const formatValue = (key: string, value: any) => {
    if (!value) return "-";

    if (key.toLowerCase().includes("date")) {
      const dateObj = new Date(value);
      return dateObj.toLocaleString();
    }

    return String(value);
  };

  return (
    <div className="overflow-x-auto m-4">
      <table className="min-w-full border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-50">
        <tbody>
          {Object.entries(enquiry)
            .filter(([key]) => !excludeFields.includes(key))
            .map(([key, value]) => (
              <tr
                key={key}
                className="border-b border-gray-200 dark:border-gray-600"
              >
                <td className="px-4 py-2 font-medium">{key}</td>
                <td className="px-4 py-2">{formatValue(key, value)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
