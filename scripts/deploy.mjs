import { spawnSync } from "node:child_process";
import { loadSite } from "./load-site.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npm run deploy -- <site-id>");
  process.exit(1);
}

process.env.SITE = id;
loadSite(id);

const formKey = process.env.TRACER_FORM_KEY?.trim();
if (!formKey) {
  console.error("TRACER_FORM_KEY is required: the Organization's Forms key from Tracer (Integrations > Cloudflare). Export it once in your shell.");
  process.exit(1);
}

const build = spawnSync("npm", ["run", "build"], { env: process.env, stdio: "inherit" });
if (build.status) process.exit(build.status ?? 1);

const deploy = spawnSync("npx", ["wrangler", "deploy", "-c", `sites/${id}/wrangler.jsonc`, "--var", `TRACER_FORM_KEY:${formKey}`], {
  env: process.env,
  stdio: "inherit",
});
process.exit(deploy.status ?? 1);
