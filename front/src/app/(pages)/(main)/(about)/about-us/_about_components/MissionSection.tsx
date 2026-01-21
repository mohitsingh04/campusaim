// MissionSection.tsx

import BadgeBorder from "@/ui/badge/BadgeBorder";
import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="relative py-14 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
      <div className="relative  grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-8 items-center">
        <div className="relative group w-full aspect-square col-span-1">
          <Image
            src="/img/main-images/yp-mission.png"
            alt="YogPrerna Mission"
            fill
            className="w-full h-full object-cover rounded-custom shadow-custom"
          />
        </div>

        <div className="col-span-2 space-y-6">
          <BadgeBorder label="Our Mission" />

          <h2 className="heading-lg mb-4 text-(--text-color-emphasis) font-semibold">
            Standardizing yoga education with transparency and trust.
          </h2>

          <div className="space-y-5 text-pretty text-(--text-color-muted)">
            <p>
              Our primary mission is to solve the crisis of credibility in the
              yoga world. We are moving beyond the role of a standard directory
              to act as a gatekeeper of quality. We manually vet every listing
              that appears on our platform, ensuring that when you see a
              certification, a degree, or a review, it is rooted in reality. We
              do the heavy lifting—verifying accreditations and checking
              backgrounds—so you can focus entirely on your learning journey.
            </p>
            <p>
              We are also on a mission to professionalize the industry. Yoga is
              not just a hobby; for many, it is a calling and a career. We are
              bridging the gap between traditional ashrams and modern
              universities, making it easier for students to find formal
              Bachelors, Masters, and Diploma courses. We want to elevate the
              respect for Yogic Sciences by treating it with the academic
              seriousness it deserves.
            </p>
            <p>
              Finally, we aim to simplify decision-making. Through tools like
              our Property Comparison and verified community forums, we provide
              the data-driven clarity students need. Our mission is to ensure
              that no student ever has to choose a school blindly, protecting
              your time, your investment, and your spiritual path.
            </p>
          </div>

          <ul className="space-y-4 list-disc list-inside pt-2 text-lg font-medium text-(--text-color-emphasis)">
            <li>Strict manual verification for every studio and college</li>
            <li>Connecting students to formal Academic Degrees and Diplomas</li>
            <li>Tools for transparent comparison and genuine community advice</li>
          </ul>
        </div>
      </div>
    </section>
  );
}