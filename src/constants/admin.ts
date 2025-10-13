const parseAdminEmails = () => {
  const raw = import.meta.env.VITE_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const ADMIN_EMAILS = parseAdminEmails();

export const isEmailWhitelistedAdmin = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
