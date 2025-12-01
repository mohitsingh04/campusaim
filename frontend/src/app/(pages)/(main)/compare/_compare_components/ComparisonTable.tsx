import { PropertyProps } from "@/types/types";
import AmenityTable from "../_comparison_table_component/AmenityTable";
import CourseTable from "../_comparison_table_component/CourseTable";

const ComparisonTable = ({
  selectedProperties,
}: {
  selectedProperties: PropertyProps[];
}) => {
  return (
    <div className="space-y-0">
          <CourseTable selectedProperties={selectedProperties} />
          <AmenityTable selectedProperties={selectedProperties} />
    </div>
  );
};

export default ComparisonTable;
