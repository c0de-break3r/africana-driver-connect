/**
 * Patches @clerk/expo to work in Expo Go (JS-only, no dev build).
 *
 * The Android-specific spec file uses `requireNativeModule` which throws
 * when the native ClerkExpo module isn't installed. This patch replaces
 * it with `requireOptionalNativeModule` which returns null instead.
 *
 * Runs automatically via the "postinstall" script in package.json.
 */

const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@clerk",
  "expo",
  "dist",
  "specs",
  "NativeClerkModule.android.js",
);

if (!fs.existsSync(filePath)) {
  console.log(
    "[postinstall] @clerk/expo Android spec not found, skipping patch.",
  );
  process.exit(0);
}

let content = fs.readFileSync(filePath, "utf-8");

if (
  content.includes("requireNativeModule") &&
  !content.includes("requireOptionalNativeModule")
) {
  content = content.replace(
    "expo.requireNativeModule",
    "expo.requireOptionalNativeModule",
  );
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(
    "[postinstall] Patched @clerk/expo for Expo Go compatibility (JS-only mode).",
  );
} else if (content.includes("requireOptionalNativeModule")) {
  console.log("[postinstall] @clerk/expo already patched for Expo Go.");
} else {
  console.log(
    "[postinstall] @clerk/expo Android spec has unexpected content, skipping patch.",
  );
}
