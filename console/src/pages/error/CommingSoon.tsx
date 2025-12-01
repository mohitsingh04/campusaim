import { GoRocket } from "react-icons/go";
import { useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const navigator = useNavigate();
  return (
    <div className="flex items-center justify-center py-4 px-4 transition-colors duration-500">
      <div className="bg-[var(--yp-primary)] shadow-sm rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 text-center w-full">
        <div className="flex justify-center mb-6">
          <GoRocket className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[var(--yp-main)] animate-bounce" />
        </div>

        <h1 className="text-2xl sm:text-4Fxl md:text-5xl lg:text-6xl font-extrabold text-[var(--yp-text-primary)] mb-4">
          Coming Soon
        </h1>

        <p className="text-[var(--yp-muted)] text-sm sm:text-base md:text-lg mb-6 leading-relaxed">
          We sincerely apologize for the inconvenience.
          <br className="hidden sm:block" />
          For any queries, feel free to reach out.
        </p>

        <div className="text-[var(--yp-text-secondary)] font-semibold text-base sm:text-lg md:text-xl mb-8 break-words">
          Contact:{" "}
          <a
            href="mailto:yogprerna@gmail.com"
            className=" hover:text-[var(--yp-main)] transition-colors"
          >
            yogprerna@gmail.com
          </a>
        </div>

        <button
          onClick={() => navigator(-1)}
          className="bg-[var(--yp-main)] text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 rounded-xl font-medium hover:scale-105 transform transition duration-300 w-full sm:w-auto"
        >
          Back
        </button>
      </div>
    </div>
  );
}
