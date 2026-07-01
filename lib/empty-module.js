// Stub for jspdf's optional browser-only deps (html2canvas / canvg / dompurify).
// These are only referenced by jsPDF's `.html()` feature, which this app never
// uses. Metro must still resolve the dynamic import specifiers, so we point them
// here to keep the bundle building.
module.exports = {};
module.exports.default = {};
