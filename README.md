# asphalt-paving-sites

One Astro site, many cities. Shared pages live in `src/`. Each city is a folder under `sites/` with its own metadata, service copy, images, domain, and Cloudflare project.

## Add a city

1. Copy `sites/_template` to `sites/<id>` (lowercase, hyphens). `_template` is not built.
2. Edit `sites/<id>/site.json`: `id` must match the folder name. Configure NAP, hours, climate notes, the Tracer forms URL, and asset paths.
3. Rewrite `sites/<id>/services.ts` with original, locally researched service copy. The template placeholders must not be published.
4. Add city-specific images under `src/assets/sites/<id>/` and reference them from `site.json`.
5. Set `SITE=<id>` and run `npm run build`.
6. In Cloudflare, create a **separate** Workers project for that domain. Point the build at this repo with environment variable `SITE=<id>` and deploy command `npx wrangler deploy -c sites/<id>/wrangler.jsonc`. Attach that city’s domain to that project only.

`wrangler.jsonc` is generated from `site.json` (`npm run sync-config`, also runs on build); deploy overwrites dashboard vars. Contact-form leads post to Tracer: `tracerFormsUrl` in `site.json` becomes the `TRACER_FORMS_URL` var, and one Forms key for every city (generated once in Tracer under Integrations, Cloudflare) is exported in your shell as `TRACER_FORM_KEY`; `npm run deploy` passes it to the Worker. Tracer matches the city by its hostname, stores each submission under the Workspace, emails the business from the Site's `info@` address, and counts it as a lead.

## Commands

```bash
SITE=pocatello npm run dev
SITE=pocatello npm run build
npm run deploy -- pocatello         # build, then wrangler deploy
```

The Cloudflare adapter emits a Worker (`dist/_worker.js`) plus static assets. Each city is its own Cloudflare project and custom domain. The Worker sends no email itself; Tracer forwards each form submission.
