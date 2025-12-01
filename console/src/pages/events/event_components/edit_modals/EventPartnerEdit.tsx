import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ImageInput } from "../../../../ui/inputs/ImageInput";
import toast from "react-hot-toast";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { useParams } from "react-router-dom";
import { EventsProps } from "../../../../types/types";

interface PartnerItem {
  name: string;
  logo: File | null;
  existingLogo: string | null;
}

export default function EventPartnersEditModal({
  isOpen,
  onClose,
  data,
  onSave,
}: {
  isOpen: boolean;
  onClose: any;
  data: EventsProps;
  onSave: () => void;
}) {
  const { objectId } = useParams();
  const [submitting, setSubmitting] = useState(false);

  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [partnerForm, setPartnerForm] = useState<PartnerItem>({
    name: "",
    logo: null,
    existingLogo: null,
  });

  useEffect(() => {
    if (!data) return;

    const formattedPartners: PartnerItem[] = Array.isArray(data.event_partners)
      ? data.event_partners.map((p) => ({
          name: p.name || "",
          logo: null,
          existingLogo: p?.logo?.[0]
            ? `${import.meta.env.VITE_MEDIA_URL}/events/${p.logo[0]}`
            : null,
        }))
      : [];

    setPartners(formattedPartners);
  }, [data]);

  if (!isOpen) return null;

  const addPartner = () => {
    const nameGiven = partnerForm.name.trim() !== "";
    const logoGiven = !!partnerForm.logo;

    if (!nameGiven && !logoGiven)
      return toast.error("Enter a name or upload a logo");

    if (nameGiven && !logoGiven)
      return toast.error("Logo is required when partner name is provided");

    if (!nameGiven && logoGiven)
      return toast.error(
        "Partner name is required when partner logo is provided"
      );

    setPartners([
      ...partners,
      {
        name: partnerForm.name,
        logo: partnerForm.logo,
        existingLogo: null,
      },
    ]);

    setPartnerForm({ name: "", logo: null, existingLogo: null });
    toast.success("Partner added");
  };

  const removePartner = (idx: number) => {
    setPartners(partners.filter((_, i) => i !== idx));
    toast.success("Partner removed");
  };

  const saveChanges = async () => {
    setSubmitting(true);

    try {
      const fd = new FormData();

      partners.forEach((p: PartnerItem, idx: number) => {
        fd.append(`partner_name_${idx}`, p.name || "");

        if (p.logo) {
          fd.append("partner_logos", p.logo);
          fd.append(`partner_has_new_logo_${idx}`, "true");
        } else {
          fd.append(`partner_has_new_logo_${idx}`, "false");
        }

        if (!p.logo && p.existingLogo) {
          fd.append(`partner_existing_logo_${idx}`, p.existingLogo);
        }
      });

      const response = await API.patch(`/event/${objectId}/partners`, fd);

      toast.success(response.data.message || "Partners updated");
      onSave();
      onClose();
    } catch (err) {
      getErrorResponse(err);
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[var(--yp-primary)] rounded-xl shadow-lg p-6 relative max-h-[85vh] flex flex-col overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--yp-text-secondary)]"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-4">
          Edit Event Partners
        </h2>

        <div className="overflow-y-auto flex-1 pr-2 space-y-10">
          <div className="p-4 rounded-lg bg-[var(--yp-tertiary)] space-y-4">
            <h3 className="text-sm font-medium text-[var(--yp-text-secondary)]">
              Add New Partner
            </h3>

            <input
              type="text"
              value={partnerForm.name}
              onChange={(e) =>
                setPartnerForm({ ...partnerForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              placeholder="Partner Name"
            />

            <ImageInput
              name="partner_logo_add"
              file={partnerForm.logo}
              onChange={(file) =>
                setPartnerForm({ ...partnerForm, logo: file })
              }
              label="Partner Logo"
            />

            <button
              onClick={addPartner}
              className="px-6 py-2 rounded-lg bg-[var(--yp-green-bg)] text-[var(--yp-green-text)]"
            >
              Add Partner
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Added Partners
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {partners.length === 0 && (
                <p className="text-[var(--yp-muted)] text-sm col-span-full">
                  No partners added yet
                </p>
              )}

              {partners.map((p: PartnerItem, idx: number) => (
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
                  ) : p.existingLogo ? (
                    <img
                      src={p.existingLogo}
                      className="w-24 h-24 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center rounded-full bg-[var(--yp-secondary)] text-[var(--yp-muted)] text-sm italic">
                      No Logo
                    </div>
                  )}

                  <button
                    onClick={() => removePartner(idx)}
                    className="w-full py-2 rounded-lg bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--yp-border-primary)]">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-red-bg)] text-[var(--yp-red-text)]"
          >
            Cancel
          </button>

          <button
            onClick={saveChanges}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)]"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
