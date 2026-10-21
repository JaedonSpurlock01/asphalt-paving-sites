/// <reference types="astro/client" />

declare module "virtual:site" {
  export interface SiteBusiness {
    name: string;
    phoneDisplay: string;
    phoneTel: string;
    email: string;
    city: string;
    region: string;
    regionName: string;
    country: string;
    url: string;
    latitude: string;
    longitude: string;
    priceRange: string;
    serviceAreaLabel: string;
  }

  export interface SiteConfig {
    id: string;
    cloudflareProject: string;
    /** Tracer's public forms endpoint, e.g. https://tracer.example.com/api/forms */
    tracerFormsUrl: string;
    market: {
      climateLabel: string;
      climateSummary: string;
      pavingSeason: string;
    };
    assets: Record<
      "logoLight" | "logoDark" | "hero" | "driveway" | "lot" | "road" | "repair" | "seal" | "process",
      string
    > & { favicon?: string };
    business: SiteBusiness;
    socials: { name: string; href: string }[];
    hours: { days: string; time: string }[];
    serviceOptions: string[];
    outboundLink?: { href: string; text: string };
    outboundLinks?: { href: string; text: string }[];
  }

  const config: SiteConfig;
  export default config;
}

declare module "virtual:services" {
  import type { ServicePage } from "./data/services";
  export const services: ServicePage[];
  export function getService(slug: string): ServicePage | undefined;
}

declare module "virtual:site-assets" {
  import type { ImageMetadata } from "astro";
  const assets: Record<
    "logoLight" | "logoDark" | "hero" | "driveway" | "lot" | "road" | "repair" | "seal" | "process",
    ImageMetadata
  > & { favicon?: ImageMetadata };
  export default assets;
}

type CloudflareEnv = {
  /** Tracer's public forms endpoint; set from site.json by sync-config. */
  TRACER_FORMS_URL: string;
  /** The Organization's Forms key from Tracer (Integrations > Cloudflare). Passed to every city by `npm run deploy` from the TRACER_FORM_KEY environment variable. */
  TRACER_FORM_KEY: string;
};

type Runtime = import("@astrojs/cloudflare").Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends Runtime {}
}
