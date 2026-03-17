const DEFAULT_BASE_URL = "https://akwantuo.com";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getSystemBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SYSTEM_BASE_URL;
  if (envUrl) {
    return stripTrailingSlash(envUrl);
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return stripTrailingSlash(window.location.origin);
  }

  return DEFAULT_BASE_URL;
};

export const slugifyDisplayName = (displayName?: string) => {
  const raw = (displayName ?? "").toString().trim();
  if (!raw) {
    return "";
  }

  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const buildVendorUrl = (displayName?: string) => {
  const base = getSystemBaseUrl();
  const slug = slugifyDisplayName(displayName);
  return slug ? `${base}/${slug}` : base;
};
