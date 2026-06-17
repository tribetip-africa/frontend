import type { OnboardingStep } from "@/lib/creator-onboarding-progress";

type CreatorOnboardingStepperProps = {
  steps: OnboardingStep[];
};

function stepIndicator(status: OnboardingStep["status"]): string {
  if (status === "complete") {
    return "border-green-200 bg-green-50 text-green-800";
  }

  if (status === "current") {
    return "border-accent bg-accent-soft text-brand-900 ring-2 ring-accent/30";
  }

  return "border-brand-100 bg-white text-brand-500";
}

export function CreatorOnboardingStepper({ steps }: CreatorOnboardingStepperProps) {
  const currentStep = steps.find((step) => step.status === "current");

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-900">Getting started</h2>
          <p className="mt-1 text-sm text-brand-700">
            {currentStep?.description ?? "You are live and ready to receive tips."}
          </p>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-brand-500">
          {steps.filter((step) => step.status === "complete").length} of {steps.length} complete
        </p>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`rounded-2xl border px-3 py-3 ${stepIndicator(step.status)}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold">{step.label}</p>
            <p className="mt-1 text-xs opacity-80">
              {step.status === "complete"
                ? "Done"
                : step.status === "current"
                  ? "In progress"
                  : "Up next"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
