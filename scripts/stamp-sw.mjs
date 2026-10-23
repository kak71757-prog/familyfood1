/**
 * postbuild: stamps the service-worker cache version with the Next BUILD_ID.
 * Without this, a redeploy keeps the old SW cache name and the old cached
 * index.html references chunk URLs that no longer exist → boot loop /
 * infinite "load" for returning users. New stamp → new cache → clean swap.
 */
import fs from "fs";
/* Build id lives inside the prerendered HTML for static exports. */
const html = fs.readFileSync("out/index.html", "utf8");
const m = html.match(/"buildId":"([^"]+)"/);
const bid = m ? m[1] : Date.now().toString(36);
const f = "out/sw.js";
const sw = fs.readFileSync(f, "utf8").replace("__STAMP__", bid);
fs.writeFileSync(f, sw);
console.log("sw.js stamped: pr-" + bid);
