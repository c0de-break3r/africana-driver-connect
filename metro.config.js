const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add convex folder to watch folders for API imports
config.watchFolders = [...(config.watchFolders || []), `${__dirname}/convex`];

module.exports = withNativewind(config);
