import toast from "react-hot-toast";

const CustomToast = () => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } max-w-xs w-full bg-[var(--yp-primary)] shadow-lg rounded-lg pointer-events-auto flex`}
    >
      <div className="flex-1 w-0 p-4">
        <p className="text-sm font-medium text-[var(--yp-text-primary)]">
          Please Give Your Feedback
        </p>
      </div>
      <div className="flex border-l border-[var(--yp-border-primary)]">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[var(--yp-text-secondary)] hover:opacity-80 focus:outline-none"
        >
          ✕
        </button>
      </div>
    </div>
  ));
};
export default CustomToast;
