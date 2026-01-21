import React from "react";
import { ButtonGroup } from "../buttons/ButtonGroup";
import { LuCircleCheck } from "react-icons/lu";

export default function EnquirySubmitted({
  setSubmitted,
}: {
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="bg-(--primary-bg) text-(--text-color) shadow-custom rounded-custom p-8 text-center">
      <div className="w-16 h-16 bg-(--success-subtle) rounded-full flex items-center justify-center mx-auto mb-4">
        <LuCircleCheck className="w-8 h-8 text-(--success)" />
      </div>
      <h3 className="text-2xl font-bold text-(--text-color-emphasis) mb-2">
        Thank You!
      </h3>
      <p className="text-(--text-color)  mb-6 leading-relaxed">
        Your enquiry has been submitted successfully. We’ll get back to you
        shortly.
      </p>


      <ButtonGroup
        label="Send Another Enquiry"
        onClick={() => setSubmitted(false)}
        type="submit"
        disable={false}
      />
    </div>
  );
}
