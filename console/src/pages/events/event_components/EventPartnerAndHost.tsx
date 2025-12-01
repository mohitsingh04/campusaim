import { useState } from "react";
import toast from "react-hot-toast";
import { ImageInput } from "../../../ui/inputs/ImageInput";

interface EventPartnerProps {
  onNext: (values: any) => void;
  defaultData: any;
  onBack: () => void;
}

interface PartnerItem {
  name: string;
  logo: File | null;
}

export default function EventPartnerAndHost({
  onNext,
  defaultData,
  onBack,
}: EventPartnerProps) {
  const [hostName, setHostName] = useState(defaultData?.host_name || "");
  const [hostImage, setHostImage] = useState<File | null>(
    defaultData?.host_image || null
  );

  const [partners, setPartners] = useState<PartnerItem[]>(
    defaultData?.event_partners || []
  );

  const [partnerForm, setPartnerForm] = useState<PartnerItem>({
    name: "",
    logo: null,
  });

  // --------------------------------------------------
  // ADD PARTNER VALIDATION: If one field is given other is required
  // --------------------------------------------------
  const addPartner = () => {
    const nameGiven = partnerForm.name.trim() !== "";
    const logoGiven = !!partnerForm.logo;

    if (!nameGiven && !logoGiven) {
      toast.error("Enter a name or upload a logo");
      return;
    }

    if (nameGiven && !logoGiven) {
      toast.error("Logo is required when partner name is provided");
      return;
    }

    if (!nameGiven && logoGiven) {
      toast.error("Partner name is required when partner logo is provided");
      return;
    }

    setPartners([...partners, partnerForm]);
    setPartnerForm({ name: "", logo: null });
    toast.success("Partner added");
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
    toast.success("Partner removed");
  };

  // --------------------------------------------------
  // HOST VALIDATION: If one field is given other is required
  // --------------------------------------------------
  const handleNext = () => {
    const hostNameGiven = hostName.trim() !== "";
    const hostImageGiven = !!hostImage;

    if (hostNameGiven && !hostImageGiven) {
      toast.error("Host image is required when host name is provided");
      return;
    }

    if (!hostNameGiven && hostImageGiven) {
      toast.error("Host name is required when host image is provided");
      return;
    }

    onNext({
      host_name: hostName || "",
      host_image: hostImage || null,
      event_partners: partners,
    });
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--yp-text-secondary)]">
          Host Name
        </label>
        <input
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="Enter Host Name (optional)"
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />

        <ImageInput
          name="host_image"
          file={hostImage}
          onChange={(file) => setHostImage(file)}
          label="Host Image (optional)"
        />
      </div>

      {/* ADD PARTNER FORM */}
      <div className="p-4 rounded-lg bg-[var(--yp-tertiary)] space-y-4">
        <h3 className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          Add New Partner
        </h3>

        <input
          type="text"
          value={partnerForm.name}
          onChange={(e) =>
            setPartnerForm({ ...partnerForm, name: e.target.value })
          }
          placeholder="Partner Name (optional)"
          className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
        />

        <ImageInput
          name="partner_logo_add"
          file={partnerForm.logo}
          onChange={(file) => setPartnerForm({ ...partnerForm, logo: file })}
          label="Partner Logo (optional)"
        />

        <button
          onClick={addPartner}
          type="button"
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
        >
          Add Partner
        </button>
      </div>

      <div>
        <h3 className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
          Added Partners
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[var(--yp-tertiary)] flex flex-col items-center gap-4 shadow-sm"
            >
              <p className="text-base font-semibold text-[var(--yp-text-primary)] text-center">
                {p.name || "(No Name)"}
              </p>

              {p.logo ? (
                <img
                  src={URL.createObjectURL(p.logo)}
                  className="w-24 h-24 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center rounded-full bg-[var(--yp-secondary)] text-[var(--yp-muted)] text-sm italic">
                  No Logo
                </div>
              )}

              <button
                onClick={() => removePartner(idx)}
                className="w-full py-2 mt-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
              >
                Remove
              </button>
            </div>
          ))}

          {partners.length === 0 && (
            <p className="text-[var(--yp-muted)] text-sm col-span-full">
              No partners added yet
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-gray-text)] bg-[var(--yp-gray-bg)]"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
