import BasicDetailsFields from "./BasicDetailsFields";
import { CategoryProps } from "../../../../types/types";
import PropertyLogo from "./PropertyLogo";
import FeaturedImage from "./FeaturedImage";
import PropertyDescription from "./PropertyDescription";

interface BasicDetailsProps {
	property: any;
	allProperty: any;
	categories: CategoryProps[];
	getCategoryById: (id: string) => string | undefined;
	getPropertyBasicDetails: () => void;
}

export default function BasicDetails({
	property,
	allProperty,
	categories,
	getCategoryById,
	getPropertyBasicDetails,
}: BasicDetailsProps) {
	return (
		<div>
			<div className="grid grid-cols-2 px-4 pt-4 gap-4">
				<PropertyLogo
					property={property}
					getPropertyBasicDetails={getPropertyBasicDetails}
				/>
				<FeaturedImage
					property={property}
					getPropertyBasicDetails={getPropertyBasicDetails}
				/>
			</div>
			<BasicDetailsFields
				getPropertyBasicDetails={getPropertyBasicDetails}
				property={property}
				allProperty={allProperty}
				categories={categories}
				getCategoryById={getCategoryById}
			/>
			<div className="px-4 pb-4">
				<PropertyDescription
					property={property}
					getProperty={getPropertyBasicDetails}
				/>
			</div>
		</div>
	);
}
