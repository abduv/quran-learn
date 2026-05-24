const KEY = "qln_admin_ok";
const USER = import.meta.env.VITE_ADMIN_USER || "admin";
const PASS = import.meta.env.VITE_ADMIN_PASS || "admin";

export function isAdminOk(): boolean {
  return sessionStorage.getItem(KEY) === "1";
}

export function promptAdmin(): boolean {
  const u = window.prompt("Username");
  if (u === null) return false;
  const p = window.prompt("Password");
  if (p === null) return false;
  const ok = u === USER && p === PASS;
  if (ok) sessionStorage.setItem(KEY, "1");
  return ok;
}

export function logoutAdmin() {
  sessionStorage.removeItem(KEY);
}
