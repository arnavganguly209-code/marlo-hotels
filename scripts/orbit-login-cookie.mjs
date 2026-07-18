import "dotenv/config";

const baseUrl = (process.env.ORBIT_TEST_BASE_URL || "http://localhost:3010").replace(
  /\/$/,
  ""
);
const passkey = process.env.ORBIT_ADMIN_PASSKEY;

if (!passkey) {
  console.error("ORBIT_ADMIN_PASSKEY missing");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/orbit/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: baseUrl,
  },
  body: JSON.stringify({ passkey }),
});

const setCookie = response.headers.getSetCookie?.() || [];
const cookieHeader =
  setCookie
    .map((value) => value.split(";")[0])
    .filter(Boolean)
    .join("; ") || response.headers.get("set-cookie")?.split(";")[0] || "";

const body = await response.json().catch(() => ({}));
if (!response.ok || !cookieHeader) {
  console.error("LOGIN_FAIL", response.status, body.error || "");
  process.exit(1);
}

process.stdout.write(cookieHeader);
