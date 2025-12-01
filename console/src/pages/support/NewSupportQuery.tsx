import { useState } from "react";
import {
  FiFileText,
  FiRefreshCcw,
  FiBarChart2,
  FiCreditCard,
  FiGlobe,
  FiHelpCircle,
} from "react-icons/fi";
import { useNavigate, useOutletContext } from "react-router-dom";
import { API } from "../../contexts/API"; // adjust path if needed
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { DashboardOutletContextProps, UserProps } from "../../types/types";
import { getErrorResponse } from "../../contexts/Callbacks";
import Badge from "../../ui/badge/Badge";

// ---------- Stepper ----------
interface StepperProps {
  step: number;
}

export function Stepper({ step }: StepperProps) {
  const steps = [
    { id: 1, label: "Create Ticket" },
    { id: 2, label: "Describe Issue" },
  ];

  return (
    <div className="w-full px-4 sm:px-8 my-6">
      <div className="flex items-center justify-between relative">
        {steps.map((s, idx) => (
          <div
            key={s.id}
            className="flex-1 flex flex-col items-center relative"
          >
            {/* Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 z-10 rounded-full border-2 transition ${
                step >= s.id
                  ? "bg-[var(--yp-main)] border-[var(--yp-main)] text-white"
                  : "bg-[var(--yp-primary)] border-[var(--yp-tertiary)]"
              }`}
            >
              {s.id}
            </div>

            {/* Label */}
            <span
              className={`mt-2 text-xs sm:text-sm text-center ${
                step === s.id
                  ? "text-[var(--yp-main)] font-semibold"
                  : "text-[var(--yp-muted)]"
              }`}
            >
              {s.label}
            </span>

            {/* Connector */}
            {idx < steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full">
                <div
                  className={`h-1 transition-all ${
                    step > s.id ? "bg-[var(--yp-main)]" : "bg-[var(--yp-muted)]"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 1 ----------
interface Step1Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setSelectedTopic: React.Dispatch<React.SetStateAction<string | null>>;
}

export function Step1TopicSelect({ setStep, setSelectedTopic }: Step1Props) {
  const topics = [
    { name: "Activation and KYC", icon: <FiFileText /> },
    { name: "Transactions and Refunds", icon: <FiRefreshCcw /> },
    { name: "Settlements", icon: <FiBarChart2 /> },
    { name: "Payment Methods", icon: <FiCreditCard /> },
    { name: "International payments", icon: <FiGlobe /> },
    { name: "Account related assistance", icon: <FiHelpCircle /> },
  ];

  return (
    <div>
      <p className="text-md text-[var(--yp-muted)] mb-6">
        Choose a topic to continue
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {topics.map((topic, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedTopic(topic.name);
              setStep(2);
            }}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[var(--yp-secondary)] hover:bg-[var(--yp-tertiary)] transition shadow-sm"
          >
            <span className="flex items-center gap-3 font-medium">
              <span className="text-lg text-[var(--yp-main)]">
                {topic.icon}
              </span>
              {topic.name}
            </span>
            <span className="text-[var(--yp-main)] font-bold">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Step 2 ----------
interface Step2Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  selectedTopic: string | null;
  authUser: UserProps | null;
}

export function Step2DescribeIssue({
  setStep,
  selectedTopic,
  authUser,
}: Step2Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("userId", String(authUser?.uniqueId || ""));
      formData.append("subject", selectedTopic || "");
      formData.append("text", message);

      files.forEach((f) => formData.append("files", f));

      const res = await API.post("/support", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/dashboard/support/${res?.data?.support?._id}`);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Badge label={selectedTopic} color="blue" />

      {/* Fields */}
      <div className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Attachments</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-[var(--yp-muted)] bg-[var(--yp-input-primary)] rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--yp-main)] file:text-[var(--yp-primary)] hover:file:opacity-70 cursor-pointer"
          />
          {files.length > 0 && (
            <ul className="mt-2 text-sm text-[var(--yp-muted)] list-disc list-inside">
              {files.map((f, idx) => (
                <li key={idx}>
                  <span className="font-medium">{f.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          {loading ? "Submitting..." : "Start Chat"}
        </button>
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-text-primary)] bg-[var(--yp-secondary)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function NewSupportQuery() {
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const [step, setStep] = useState<number>(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <div className="flex flex-col text-[var(--yp-text-primary)] transition-colors">
      {/* Header */}
      <Breadcrumbs
        title="Support"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          {
            label: step === 1 ? "Create Support Ticket" : "Describe your Issue",
          },
        ]}
      />

      {/* Stepper */}
      <Stepper step={step} />

      {/* Main */}
      <main className="flex-1 flex justify-center items-start">
        <div className="w-full bg-[var(--yp-primary)] rounded-2xl p-4 sm:p-8 flex flex-col backdrop-blur-lg">
          {step === 1 && (
            <Step1TopicSelect
              setStep={setStep}
              setSelectedTopic={setSelectedTopic}
            />
          )}
          {step === 2 && selectedTopic && (
            <Step2DescribeIssue
              setStep={setStep}
              selectedTopic={selectedTopic}
              authUser={authUser}
            />
          )}
        </div>
      </main>
    </div>
  );
}
