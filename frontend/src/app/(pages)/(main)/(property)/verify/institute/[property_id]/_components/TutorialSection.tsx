import { LuCircleCheck, LuMail, LuShield } from "react-icons/lu";

interface TutorialSectionProps {
  currentStep: number;
}

const steps = [
  {
    icon: LuMail,
    title: "Email Verification",
    description:
      "We'll send an OTP to your registered email address to confirm your identity.",
    color: "from-purple-500 to-purple-600",
  },
  // {
  //   icon: LuSmartphone,
  //   title: "Mobile Verification",
  //   description:
  //     "Once your email is verified, verify your mobile number to complete secure authentication.",
  //   color: "from-violet-500 to-violet-600",
  // },
  {
    icon: LuShield,
    title: "Give Consent",
    description:
      "Provide your consent to securely use your verified contact details for ownership validation.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: LuCircleCheck,
    title: "Verification Complete",
    description:
      "All steps completed successfully! Your property verification is now confirmed.",
    color: "from-green-500 to-green-600",
  },
];

export default function TutorialSection({ currentStep }: TutorialSectionProps) {
  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-10 lg:p-16 bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
      <div className="max-w-xl w-full">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Property Verification Process
          </h2>
          <p className="text-gray-600 leading-relaxed">
            A secure, step-by-step process to verify your ownership and maintain
            trust within our platform.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div
                key={index}
                className={`relative flex gap-4 p-5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-purple-50 border-2 border-purple-400 shadow-lg scale-105"
                    : isCompleted
                    ? "bg-green-50 border border-green-300"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div className="flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${
                      isActive || isCompleted
                        ? stepItem.color
                        : "from-gray-300 to-gray-400"
                    } shadow-md`}
                  >
                    <StepIcon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">
                      STEP {stepNumber}
                    </span>
                    {isCompleted && (
                      <LuCircleCheck className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {stepItem.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>

                {!isCompleted && stepNumber !== steps.length && (
                  <div className="absolute left-9 top-20 w-0.5 h-6 bg-gray-300" />
                )}
                {isCompleted && stepNumber !== steps.length && (
                  <div className="absolute left-9 top-20 w-0.5 h-6 bg-green-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
