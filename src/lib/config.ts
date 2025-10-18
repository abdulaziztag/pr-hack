/**
 * Feature flags and configuration
 * All NEXT_PUBLIC_* values are client-safe for this demo.
 */

export const HIDE_DEMO_COPY =
  (process.env.NEXT_PUBLIC_HIDE_DEMO_COPY ?? "1") === "1"; // default: hide demo copy

export const DEV_ROLE_SHORTCUTS =
  (process.env.NEXT_PUBLIC_DEV_ROLE_SHORTCUTS ?? "0") === "1"; // default: OFF

export const ACCESS_CODES = {
  user: process.env.NEXT_PUBLIC_ACCESS_USER_CODE ?? "",
  lender: process.env.NEXT_PUBLIC_ACCESS_LENDER_CODE ?? "",
  admin: process.env.NEXT_PUBLIC_ACCESS_ADMIN_CODE ?? "",
};



