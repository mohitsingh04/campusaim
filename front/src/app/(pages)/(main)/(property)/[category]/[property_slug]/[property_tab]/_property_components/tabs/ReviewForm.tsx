import { phoneInputClass } from "@/common/ExtraData";
import LoginRequiredModal from "@/components/modals/LoginRequired";
import API from "@/context/API";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import { reviewSchema } from "@/context/ValidationSchema";
import { PropertyProps } from "@/types/PropertyTypes";
import { UserProps } from "@/types/UserTypes";
import ButtonGroupSend from "@/ui/buttons/ButtonGroup";
import { InputGroup, TextareaGroup } from "@/ui/form/FormComponents";
import HeadingLine from "@/ui/headings/HeadingLine";
import { useFormik } from "formik";
import { useState } from "react";
import { LuStar } from "react-icons/lu";
import PhoneInput from "react-phone-input-2";
import { toast } from "react-toastify";

export default function ReviewForm({
  property,
  onSave,
  profile,
}: {
  property: PropertyProps | null;
  onSave: () => void;
  profile: UserProps | null;
}) {
  const [rating, setRating] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      property_id: property?.uniqueId || "",
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.mobile_no || "",
      review: "",
    },
    enableReinitialize: true,
    validationSchema: reviewSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      if (rating === 0) {
        toast.error("Please select at least 1 star rating.");
        return;
      }
      setSubmitting(true);
      const payload = {
        ...values,
        rating,
      };

      try {
        const response = await API.post(`/review`, payload);
        getSuccessResponse(response);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
        resetForm();
        setRating(0);
        onSave();
      }
    },
  });

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <LuStar
        key={i}
        className={`w-6 h-6  cursor-pointer ${
          i < rating
            ? "text-(--warning) fill-(--warning)"
            : "text-(--text-color)"
        }`}
        onClick={() => setRating(i + 1)}
      />
    ));
  };

  return (
    <div>
      <form className="mt-8 space-y-4" onSubmit={formik.handleSubmit}>
        <HeadingLine title="Share Your Experience" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <InputGroup
              label="Your Name"
              type="text"
              id="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "name")}
          </div>
          <div>
            <InputGroup
              label="Email Address"
              type="text"
              id="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {getFormikError(formik, "email")}
          </div>
          <div>
            <label className="text-xs mb-1 block">Phone</label>
            <PhoneInput
              country={"in"}
              disableCountryGuess
              value={formik.values.phone}
              onChange={(value) => formik.setFieldValue("phone", value)}
              onBlur={() => formik.setFieldTouched("phone", true)}
              inputClass={phoneInputClass.input}
              buttonClass={phoneInputClass.button}
              dropdownClass={phoneInputClass.dropdown}
            />
            {getFormikError(formik, "phone")}
          </div>
          <div className="space-y-1 ">
            <p>Your Rating</p>
            <div className="flex px-2">{renderStars()}</div>
          </div>
        </div>
        <div>
          <TextareaGroup
            label="Your Review"
            id="review"
            value={formik.values.review}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {getFormikError(formik, "review")}
        </div>
        {profile ? (
          <ButtonGroupSend
            label="Submit Review"
            type="submit"
            disable={formik.isSubmitting}
            isSubmitting={formik.isSubmitting}
          />
        ) : (
          <ButtonGroupSend
            label="Submit Review"
            type="button"
            onClick={() => setModalOpen(true)}
            disable={false}
          />
        )}
      </form>
      <LoginRequiredModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
