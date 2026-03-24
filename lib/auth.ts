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

// export const getAuthToken = () => {
//   const authToken = Cookies.get("ev-access-token");
//   if (!authToken) {
//     throw new Error("No auth token found");
//   }
//   return authToken;
// };

export const removeAuthToken = () => {
  Cookies.remove("ev-access-token");
  Cookies.remove("ev-refresh-token");
};
