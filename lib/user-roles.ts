const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminAccountEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails.has(email.trim().toLowerCase()));
}

export function getUserAccountType(email: string | null | undefined): "admin" | "user" {
  return isAdminAccountEmail(email) ? "admin" : "user";
}
