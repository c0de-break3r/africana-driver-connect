import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";

import { OnboardingOptionRow } from "@/components/ui";
import { DriverStepShell } from "@/components/driver-step-shell";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const OPTIONS = [
  { value: "employed", label: "Currently employed" },
  { value: "looking", label: "Looking for work" },
  { value: "open", label: "Open to offers" },
];

export default function EmploymentStatusScreen() {
  const { employmentStatus, setEmploymentStatus, setStep } =
    useDriverOnboardingStore();

  const handleSelect = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmploymentStatus(value);
  };

  const handleContinue = () => {
    if (!employmentStatus) return;
    setStep(4);
    router.push("/(onboarding)/driver/goals" as Href);
  };

  return (
    <DriverStepShell
      stepIndex={3}
      title="What's your current employment status?"
      description="We'll tailor the opportunities we show you."
      buttonDisabled={!employmentStatus}
      onContinue={handleContinue}
    >
      {OPTIONS.map((option, index) => (
        <OnboardingOptionRow
          key={option.value}
          title={option.label}
          selected={employmentStatus === option.value}
          isLast={index === OPTIONS.length - 1}
          onPress={() => handleSelect(option.value)}
        />
      ))}
    </DriverStepShell>
  );
}
