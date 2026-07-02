const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// jspdf's package "main" points at the Node build (jspdf.node.min.js), which
// contains an AMD-style `require(["html2canvas"], ...)` call that Metro can't
// bundle. The ES build has no such call, so redirect jspdf to it. The ES build
// still has dynamic import() calls for the optional `.html()` deps (which this
// app never uses); stub those so Metro can resolve them.
//
// It also statically imports `fast-png` (only used to decode PNG images we
// never add). fast-png's module init runs `new TextDecoder("latin1")`, which
// Expo's native TextDecoder polyfill rejects and crashes the whole screen — so
// stub it out too.
const jspdfEs = path.join(__dirname, "node_modules/jspdf/dist/jspdf.es.min.js");
const emptyModule = path.join(__dirname, "lib/empty-module.js");
const stubbedModules = new Set(["html2canvas", "canvg", "dompurify", "fast-png"]);
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "jspdf") {
    return { type: "sourceFile", filePath: jspdfEs };
  }
  if (stubbedModules.has(moduleName)) {
    return { type: "sourceFile", filePath: emptyModule };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
