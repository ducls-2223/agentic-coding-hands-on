import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_FILE = "playwright/.auth/user.json";

const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? "e2e@saa-test.local";
const E2E_NAME = "E2E Tester";

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in: number;
  token_type: string;
  user: unknown;
}

setup("authenticate", async ({ browser }) => {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !anon || !secret) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY in env",
    );
  }

  // 1. Ensure the user exists (admin bypasses signup gate). Tolerate 422 conflict.
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: E2E_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: E2E_NAME },
    }),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    if (!/already.*registered|email.*exists|user.*registered|email_exists/i.test(text)) {
      throw new Error(
        `admin.createUser failed (${createRes.status}): ${text}`,
      );
    }
  }

  // 2. Admin-mint a magiclink. Returns properties.hashed_token usable in verifyOtp.
  //    This bypasses the "email logins are disabled" gate because it's an admin path.
  const linkRes = await fetch(`${url}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "magiclink", email: E2E_EMAIL }),
  });
  if (!linkRes.ok) {
    throw new Error(
      `admin.generateLink failed (${linkRes.status}): ${await linkRes.text()}`,
    );
  }
  const linkPayload = (await linkRes.json()) as {
    properties?: {
      hashed_token?: string;
      action_link?: string;
      email_otp?: string;
    };
    hashed_token?: string;
    action_link?: string;
  };
  const hashed = linkPayload.properties?.hashed_token ?? linkPayload.hashed_token;
  const actionLink = linkPayload.properties?.action_link ?? linkPayload.action_link;
  if (!hashed && !actionLink) {
    throw new Error("admin.generateLink returned neither hashed_token nor action_link");
  }

  // 3. Exchange for a session. Prefer following the action_link (signed verifier
  //    URL) which returns a redirect with the session in the URL hash/cookies.
  //    Fall back to verify-by-token if no action_link.
  let session: Session;
  if (actionLink) {
    // The action_link's verify endpoint redirects to redirect_to with `#access_token=...`.
    // We send the GET ourselves so we can extract the redirect Location header.
    const followRes = await fetch(actionLink, { redirect: "manual" });
    const loc = followRes.headers.get("location");
    if (!loc) {
      throw new Error(`action_link follow returned no Location header (status ${followRes.status})`);
    }
    // Location looks like: <redirect_to>#access_token=...&refresh_token=...&expires_in=...&token_type=...
    const hashIdx = loc.indexOf("#");
    if (hashIdx < 0) {
      throw new Error(`action_link redirect missing fragment: ${loc}`);
    }
    const params = new URLSearchParams(loc.slice(hashIdx + 1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const expires_in = Number(params.get("expires_in") ?? "3600");
    const token_type = params.get("token_type") ?? "bearer";
    if (!access_token || !refresh_token) {
      throw new Error(`action_link fragment missing tokens: ${loc}`);
    }
    // Fetch the user payload via the new access_token so the session matches
    // what @supabase/ssr expects.
    const userRes = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) {
      throw new Error(`user fetch failed (${userRes.status}): ${await userRes.text()}`);
    }
    const user = await userRes.json();
    session = {
      access_token,
      refresh_token,
      expires_in,
      expires_at: Math.floor(Date.now() / 1000) + expires_in,
      token_type,
      user,
    };
  } else if (hashed) {
    const verifyRes = await fetch(`${url}/auth/v1/verify`, {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "magiclink", token: hashed, email: E2E_EMAIL }),
    });
    if (!verifyRes.ok) {
      throw new Error(
        `verifyOtp failed (${verifyRes.status}): ${await verifyRes.text()}`,
      );
    }
    session = (await verifyRes.json()) as Session;
  } else {
    throw new Error("no exchange path available");
  }
  if (!session.access_token) {
    throw new Error(`no access_token in session: ${JSON.stringify(session)}`);
  }

  // 4. Build @supabase/ssr cookie format and persist via Playwright storageState.
  const projectRef = new URL(url).hostname.split(".")[0];
  const cookiePrefix = `sb-${projectRef}-auth-token`;
  const sessionJson = JSON.stringify(session);
  const encoded = `base64-${Buffer.from(sessionJson, "utf8").toString("base64")}`;
  const MAX_CHUNK = 3000;

  const cookies =
    encoded.length <= MAX_CHUNK
      ? [{ name: cookiePrefix, value: encoded }]
      : Array.from(
          { length: Math.ceil(encoded.length / MAX_CHUNK) },
          (_, i) => ({
            name: `${cookiePrefix}.${i}`,
            value: encoded.slice(i * MAX_CHUNK, (i + 1) * MAX_CHUNK),
          }),
        );

  const context = await browser.newContext();
  await context.addCookies(
    cookies.map((c) => ({
      ...c,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax" as const,
    })),
  );

  const page = await context.newPage();
  const res = await page.goto("/");
  expect(res?.status(), "home should respond OK with the session cookie").toBeLessThan(400);
  expect(page.url(), "home should not redirect to /login").not.toContain("/login");

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await context.storageState({ path: AUTH_FILE });
  await context.close();
});
