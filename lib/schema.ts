import { z } from "zod";

export const signInSchema = z.object({
  // userType: z
  //   .enum(userRoles.map((role) => role.value))
  //   .default(userRoles[0].value)
  //   .describe("The type of user you are"),
  identifier: z
    .string()
    .min(1, { message: "Identifier is required" })
    .describe("The identifier you use to sign in"),
  password: z
    .string()
    .min(8, { message: "Password is required" })
    .describe("The password you use to sign in"),
});
