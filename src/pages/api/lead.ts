import { env as workerEnv } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { business, serviceOptions } from "../../data/site";

export const prerender = false;

function clean(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function readEnv(key: "TRACER_FORMS_URL" | "TRACER_FORM_KEY", locals: App.Locals): string {
  const raw = locals.runtime?.env?.[key] ?? (workerEnv as Record<string, unknown>)[key];
  return typeof raw === "string" ? raw.trim() : "";
}

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();

  if (clean(form.get("company_website"), 200)) {
    return redirect("/thank-you", 303);
  }

  const name = clean(form.get("name"), 80);
  const phone = clean(form.get("phone"), 30);
  const email = clean(form.get("email"), 120);
  const size = clean(form.get("size"), 12);
  const service = clean(form.get("service"), 80);

  const sizeNumber = Number(size);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const serviceOk = serviceOptions.includes(service as (typeof serviceOptions)[number]);
  const valid =
    name.length > 1 &&
    digits(phone).length >= 10 &&
    emailOk &&
    serviceOk &&
    Number.isFinite(sizeNumber) &&
    sizeNumber > 0 &&
    sizeNumber < 10000000;

  if (!valid) {
    return redirect("/contact/?error=1#error-fields", 303);
  }

  // Tracer stores the submission under this Site's Workspace, forwards it to the business
  // from this Site's address, and counts it as a lead. Every Site shares one Forms key and
  // names itself by hostname.
  const formsUrl = readEnv("TRACER_FORMS_URL", locals);
  const formKey = readEnv("TRACER_FORM_KEY", locals);
  if (!formsUrl || !formKey) {
    return redirect("/contact/?error=config#error-config", 303);
  }

  const submission = {
    site: new URL(business.url).hostname,
    submissionId: crypto.randomUUID(),
    page: new URL(request.headers.get("referer") ?? "/contact/", request.url).pathname,
    fields: {
      Name: name,
      Phone: phone,
      Email: email,
      Service: service,
      "Approx. size": `${sizeNumber.toLocaleString("en-US")} sq ft`,
    },
  };

  try {
    const response = await fetch(formsUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${formKey}` },
      body: JSON.stringify(submission),
    });
    if (!response.ok) {
      console.error("Tracer refused the lead:", response.status, await response.text().catch(() => ""));
      return redirect("/contact/?error=send#error-send", 303);
    }
  } catch (error) {
    console.error("Tracer lead post failed:", error);
    return redirect("/contact/?error=send#error-send", 303);
  }

  return redirect("/thank-you", 303);
};

export const GET: APIRoute = () => new Response("Method not allowed", { status: 405 });
