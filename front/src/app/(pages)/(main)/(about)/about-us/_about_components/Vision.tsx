import BadgeBorder from "@/ui/badge/BadgeBorder";
import Image from "next/image";

export default function VisionSection() {
  return (
    <section className="relative py-14 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-8 items-center">
        {/* Image – FIRST on mobile, SECOND on desktop */}
        <div className="relative w-full aspect-square order-1 md:order-2 flex justify-center items-center">
          <div className="relative w-full max-w-sm aspect-square">
            <Image
              src="/img/main-images/yp-vision.png"
              alt="YogPrerna Vision"
              fill
              className="object-cover rounded-custom shadow-custom"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 col-span-2 order-2 md:order-1">
          <BadgeBorder label="Our Vision" />

          <h2 className="heading-lg mb-4 text-(--text-color-emphasis) font-semibold">
            Bridging the gap between ancient wisdom, academic rigor, and modern
            life.
          </h2>

          <div className="space-y-5 text-pretty text-(--text-color-muted)">
            <p>
              In a digital landscape often cluttered with superficial trends and
              unverified claims, finding a path that feels true to the roots of
              Yoga can be discouraging. Our foundational vision is to restore
              integrity to this search. We are building more than just a
              directory; we are creating a sanctuary of trust where the noise is
              filtered out, ensuring that every interaction—whether finding a
              Guru, a studio, or a university—is grounded in authenticity and
              verified quality.
            </p>

            <p>
              We are also redefining how the world views Yoga education. For too
              long, it has been seen by many as just a physical fitness routine.
              We envision a future where the professional and academic depth of
              Yogic Sciences is fully recognized. By highlighting accredited
              Universities, Colleges, and formal degrees alongside traditional
              Teacher Training, we aim to legitimize Yoga as a viable, respected
              career path for the modern professional.
            </p>

            <p>
              Transparency is the cornerstone of our platform. We believe that
              every seeker deserves to make decisions based on facts, not
              marketing. Our goal is to empower you with clear tools to compare
              institutions, understand course curriculums, and read genuine
              reviews.
            </p>

            <p>
              Ultimately, our mission extends beyond the screen. We see a world
              where access to mental peace and physical wellbeing is seamless.
              By supporting the institutions that teach these life-changing
              practices, we hope to create a ripple effect—empowering a new
              generation of teachers who will share Yoga with clarity,
              compassion, and expertise.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
