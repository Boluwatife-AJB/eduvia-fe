import Cookies from "js-cookie";

interface Tokens {
  access_token: string;
  refresh_token: string;
  tenant_slug: string;
}

export const setAuthToken = (tokens: Partial<Tokens>) => {
  if (tokens.access_token) {
    Cookies.set("ev-access-token", tokens.access_token, { expires: 30 });
  }
  if (tokens.refresh_token) {
    Cookies.set("ev-refresh-token", tokens.refresh_token, { expires: 30 });
  }
  if (tokens.tenant_slug) {
    Cookies.set("ev-tenant-slug", tokens.tenant_slug, { expires: 30 });
  }
};

export const getAuthToken = (tokenType: "access" | "refresh" | "tenant") => {
  if (tokenType === "access") {
    return Cookies.get("ev-access-token");
  }
  if (tokenType === "refresh") {
    return Cookies.get("ev-refresh-token");
  }
  if (tokenType === "tenant") {
    return Cookies.get("ev-tenant-slug");
  }
};

export const removeAuthToken = () => {
  Cookies.remove("ev-access-token");
  Cookies.remove("ev-refresh-token");
};
