import { LockIcon } from "lucide-react";
import React from "react";

export default function LegalNotFound() {
  return (
    <div className="grow px-6 py-16 flex flex-col items-center justify-center text-center">
      <LockIcon size={80} className="text-(--main) mb-6" />
      <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-(--main)">
        Policy Coming Soon
      </h2>
      <p className="text-(--text-color) max-w-xl">
        We&apos;re currently working hard to prepare this policy for you. Please
        check back soon. Once the policy is available, you’ll receive an email
        notification to stay informed.
      </p>
    </div>
  );
}
