import { PropertyProps } from "@/types/PropertyTypes";
import AmenityTable from "./AmenityTable";
import CourseTable from "./CourseTable";

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
