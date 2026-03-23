import Cookies from "js-cookie";

export const setAuthToken = (accessToken: string, refreshToken: string) => {
  Cookies.set("ev-access-token", accessToken, { expires: 30 });
  Cookies.set("ev-refresh-token", refreshToken, { expires: 30 });
};

export const getAuthToken = () => {
  const authToken = Cookies.get("ev-access-token");
  if (!authToken) {
    throw new Error("No auth token found");
  }
  return authToken;
};

export const removeAuthToken = () => {
  Cookies.remove("ev-access-token");
  Cookies.remove("ev-refresh-token");
};
