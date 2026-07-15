const {
  withAndroidManifest,
  withAppBuildGradle,
} = require("@expo/config-plugins");

/**
 * Fix 1: Force OkHttp 4.9.2 to resolve version conflict with MetaMap SDK.
 *
 * MetaMap's Android SDK (com.metamap:android-sdk) ships a newer OkHttp version
 * that removed the `okhttp3.internal.Util` class. React Native 0.79 depends on
 * OkHttp 4.9.2 which still has that class. Without forcing the version, Gradle
 * resolves to MetaMap's newer OkHttp, causing a NoClassDefFoundError at runtime.
 *
 * This plugin injects a resolution strategy into the app's build.gradle that
 * forces OkHttp 4.9.2 across all dependencies.
 *
 * Fix 2: Add tools:replace="android:allowBackup" to the AndroidManifest.
 *
 * MetaMap's Android SDK declares android:allowBackup="false" in its manifest.
 * Expo's default AndroidManifest sets android:allowBackup="true". The manifest
 * merger rejects this conflict unless we tell it to replace the attribute.
 */

const OKHTTP_FORCE_VERSION = `
configurations.all {
    resolutionStrategy {
        force 'com.squareup.okhttp3:okhttp:4.9.2'
        force 'com.squareup.okhttp3:okhttp-urlconnection:4.9.2'
    }
}
`;

function withAndroidOkHttpFix(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    const contents = gradleConfig.modResults.contents;

    // Only inject once — check for the marker comment.
    if (contents.includes("// [MetaMap] Force OkHttp 4.9.2")) {
      return gradleConfig;
    }

    const marker = `// [MetaMap] Force OkHttp 4.9.2\n${OKHTTP_FORCE_VERSION}`;

    // Insert after the `dependencies {` block opening so it applies globally.
    // We place it at the very end of the file to avoid breaking other plugins.
    gradleConfig.modResults.contents = contents + "\n" + marker;
    return gradleConfig;
  });
}

function withAndroidManifestAllowBackupFix(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure the tools namespace is declared on the root <manifest> element.
    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    const application = manifest.application?.[0];
    if (application) {
      const existing = application.$["tools:replace"] ?? "";
      const parts = existing
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!parts.includes("android:allowBackup")) {
        parts.push("android:allowBackup");
      }

      application.$["tools:replace"] = parts.join(" ");
    }

    return config;
  });
}

// Compose both fixes into a single plugin export.
function withMetaMapFixes(config) {
  config = withAndroidOkHttpFix(config);
  config = withAndroidManifestAllowBackupFix(config);
  return config;
}

module.exports = withMetaMapFixes;
