import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Persisted store for the driver-specific 10-step onboarding flow.
 *
 * Steps 1-7 capture onboarding answers before account creation.
 * Steps 8-9 create the Clerk account and verify it.
 * Step 10 lands on the driver dashboard with a "Complete your profile" banner
 * because license/vehicle info was captured but document photos were not.
 */

export type LicenseClass = "B" | "C" | "D" | "E";

export type DriverOnboardingState = {
  /** Current step index (0-9) for the 10-step driver flow. */
  currentStep: number;

  // Step 1 — Driving Experience
  yearsExperience: string | null;

  // Step 2 — Employment Status
  employmentStatus: string | null;

  // Step 3 — Driver Goals
  driverGoal: string | null;

  // Step 4 — License Verification
  fullLegalName: string;
  dateOfBirth: string;
  licenseClass: LicenseClass | null;

  // Step 5 — Vehicle Experience
  vehicleTypes: string[];

  // Step 6 — Preferred Job Type
  preferredJobType: string | null;

  // Step 7 — Preferred Location
  preferredLocation: string;

  // License verification (MetaMap)
  licenseVerificationStatus: "pending" | "in_progress" | "success" | "error";
  licenseVerificationJobId: string | null;
  licenseVerificationError: string | null;

  // Auth / progress
  verificationMethod: "email" | "phone" | null;
  onboardingComplete: boolean;
  profileDocumentsUploaded: boolean;

  setStep: (step: number) => void;
  setExperience: (yearsExperience: string) => void;
  setEmploymentStatus: (employmentStatus: string) => void;
  setDriverGoal: (driverGoal: string) => void;
  setLicenseInfo: (
    fullLegalName: string,
    dateOfBirth: string,
    licenseClass: LicenseClass,
  ) => void;
  toggleVehicleType: (vehicleType: string) => void;
  setPreferredJobType: (preferredJobType: string) => void;
  setPreferredLocation: (preferredLocation: string) => void;
  setVerificationMethod: (method: "email" | "phone") => void;
  setLicenseVerificationResult: (
    status: "pending" | "in_progress" | "success" | "error",
    jobId?: string | null,
    error?: string | null,
  ) => void;
  markOnboardingComplete: () => void;
  markProfileDocumentsUploaded: () => void;
  reset: () => void;
};

const initialState = {
  currentStep: 0,
  yearsExperience: null,
  employmentStatus: null,
  driverGoal: null,
  fullLegalName: "",
  dateOfBirth: "",
  licenseClass: null as LicenseClass | null,
  vehicleTypes: [] as string[],
  preferredJobType: null,
  preferredLocation: "",
  licenseVerificationStatus: "pending" as
    | "pending"
    | "in_progress"
    | "success"
    | "error",
  licenseVerificationJobId: null as string | null,
  licenseVerificationError: null as string | null,
  verificationMethod: null as "email" | "phone" | null,
  onboardingComplete: false,
  profileDocumentsUploaded: false,
};

export const useDriverOnboardingStore = create<DriverOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (currentStep) => set({ currentStep }),
      setExperience: (yearsExperience) => set({ yearsExperience }),
      setEmploymentStatus: (employmentStatus) => set({ employmentStatus }),
      setDriverGoal: (driverGoal) => set({ driverGoal }),
      setLicenseInfo: (fullLegalName, dateOfBirth, licenseClass) =>
        set({ fullLegalName, dateOfBirth, licenseClass }),
      toggleVehicleType: (vehicleType) =>
        set((state) => {
          const exists = state.vehicleTypes.includes(vehicleType);
          return {
            vehicleTypes: exists
              ? state.vehicleTypes.filter((v) => v !== vehicleType)
              : [...state.vehicleTypes, vehicleType],
          };
        }),
      setPreferredJobType: (preferredJobType) => set({ preferredJobType }),
      setPreferredLocation: (preferredLocation) => set({ preferredLocation }),
      setVerificationMethod: (verificationMethod) =>
        set({ verificationMethod }),
      setLicenseVerificationResult: (
        licenseVerificationStatus,
        licenseVerificationJobId = null,
        licenseVerificationError = null,
      ) =>
        set({
          licenseVerificationStatus,
          licenseVerificationJobId,
          licenseVerificationError,
        }),
      markOnboardingComplete: () =>
        set({ onboardingComplete: true, currentStep: 9 }),
      markProfileDocumentsUploaded: () =>
        set({ profileDocumentsUploaded: true }),
      reset: () => set(initialState),
    }),
    {
      name: "africana-driver-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
