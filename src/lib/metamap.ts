import { NativeModules } from "react-native";
import * as MetaMapModule from "react-native-metamap-sdk";

/**
 * Patch the MetaMap native module to silence React Native warnings about
 * missing `addListener` / `removeListeners` methods. These are required by
 * `NativeEventEmitter` but the MetaMap SDK does not implement them.
 * The events themselves still work correctly via the native bridge.
 */
function patchMetaMapModule(): void {
  const mod = NativeModules.MetaMapRNSdk;
  if (!mod) return;
  if (typeof mod.addListener !== "function") {
    mod.addListener = () => {};
  }
  if (typeof mod.removeListeners !== "function") {
    mod.removeListeners = () => {};
  }
}

patchMetaMapModule();

/**
 * Shape of the object returned by MetaMap on verificationSuccess.
 * The exact fields depend on your MetaMap flow configuration.
 */
export type MetaMapSuccessPayload = {
  identityId?: string;
  verificationId?: string;
  status?: "verified" | string;
  [key: string]: unknown;
};

export type MetaMapCanceledPayload = {
  reason?: string;
  [key: string]: unknown;
};

/**
 * Access the MetaMap native module lazily so the app does not crash at import
 * time when the module is not linked (e.g. running in Expo Go).
 */
function getMetaMapSdk() {
  try {
    return MetaMapModule.MetaMapRNSdk;
  } catch (error) {
    console.warn(
      "[MetaMap] Native module is not linked. Are you running a development build?",
      error,
    );
    return null;
  }
}

export function isMetaMapAvailable(): boolean {
  return !!getMetaMapSdk();
}

/**
 * Default theming metadata that matches the Africana Driver Connect design system.
 * MetaMap's SDK supports: buttonColor, buttonTextColor, fixedLanguage, and
 * custom fonts (regularFont, boldFont).
 */
const METAMAP_THEME: Record<string, string> = {
  // Navy primary button (matches --color-primary: #2C3E5B)
  buttonColor: "#2C3E5B",
  // White text on navy button
  buttonTextColor: "#FFFFFF",
  // English language
  fixedLanguage: "en",
};

/**
 * Launch the MetaMap verification flow themed to match the app design.
 *
 * The user's driver's license scan and selfie/liveness check are handled by
 * MetaMap's prebuilt native UI. Results are delivered via the NativeEventEmitter
 * listeners for `verificationSuccess` and `verificationCanceled`.
 *
 * Requires:
 * - EXPO_PUBLIC_METAMAP_CLIENT_ID
 * - EXPO_PUBLIC_METAMAP_FLOW_ID (optional but recommended)
 *
 * Note: this uses a native module, so it will not run in Expo Go.
 * Use a development build (`expo-dev-client`) or EAS build.
 *
 * Returns `true` if the flow was started, `false` otherwise.
 */
export function showMetaMapVerification(
  metadata?: Record<string, string>,
): boolean {
  const clientId = process.env.EXPO_PUBLIC_METAMAP_CLIENT_ID;
  const flowId = process.env.EXPO_PUBLIC_METAMAP_FLOW_ID;
  const sdk = getMetaMapSdk();

  if (!sdk) {
    console.warn(
      "[MetaMap] SDK is not available. Use a development build to run verification.",
    );
    return false;
  }

  if (!clientId) {
    console.warn(
      "[MetaMap] Missing EXPO_PUBLIC_METAMAP_CLIENT_ID. Verification cannot start.",
    );
    return false;
  }

  // Merge app theme with any caller-provided metadata.
  const mergedMetadata: Record<string, string> = {
    ...METAMAP_THEME,
    ...metadata,
  };

  sdk.showFlow(clientId, flowId ?? null, mergedMetadata);
  return true;
}
