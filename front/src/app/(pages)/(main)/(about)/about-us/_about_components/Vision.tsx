import Image from "next/image";

export default function VisionSection() {
  return (
    <section className="relative w-full overflow-hidden bg-black aspect-3/2 md:aspect-3/1">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/main-images/ca-vision.png"
          alt="YogPrerna Vision"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-left md:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 h-full w-full flex items-center px-4 sm:px-8">
        <div className="max-w-4xl space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="h-0.5 md:h-1 w-8 md:w-12 bg-(--main)" />
            <span className="text-(--main) uppercase tracking-[0.2em] md:tracking-[0.3em] font-semibold text-xs md:text-2xl">
              Our Vision
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-7xl text-white font-light leading-tight md:leading-[1.1] text-balance">
            <span className="text-(--main) font-medium">Simplifying</span>{" "}
            education discovery for a better{" "}
            <span className="text-(--main) font-medium">student future</span>.
          </h2>
        </div>
      </div>
    </section>
  );
}
