interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            index + 1 === currentStep
              ? "w-8 bg-foreground"
              : index + 1 < currentStep
                ? "w-2 bg-foreground"
                : "w-2 bg-muted"
          }`}
          key={index}
        />
      ))}
    </div>
  );
}
