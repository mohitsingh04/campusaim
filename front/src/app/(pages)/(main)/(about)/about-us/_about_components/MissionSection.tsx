import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="relative w-full overflow-hidden bg-black aspect-3/2 md:aspect-3/1">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/main-images/ca-mission.png"
          alt="Campusaim Mission"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-right md:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-linear-to-l from-black/90 via-black/40 to-transparent" />
      </div>

      <div className="relative z-10 h-full w-full flex items-center justify-end px-4 sm:px-8">
        <div className="max-w-4xl space-y-4 md:space-y-6 text-right flex flex-col items-end">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-(--main) uppercase tracking-[0.2em] md:tracking-[0.3em] font-semibold text-xs md:text-2xl">
              Our Mission
            </span>
            <div className="h-0.5 md:h-1 w-8 md:w-12 bg-(--main)" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-7xl text-white font-light leading-tight md:leading-[1.1] text-balance">
            Providing reliable{" "}
            <span className="font-medium text-(--main)">guidance</span> for
            smarter{" "}
            <span className="font-medium text-(--main)">
              education and career
            </span>{" "}
            choices.
          </h2>
        </div>
      </div>
    </section>
  );
}
