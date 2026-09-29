import { expect, test, type Page } from "@playwright/test";
import { uniqueEmail } from "./db";

const PASSWORD = "circuit2026";

function mainNav(page: Page) {
  return page.getByRole("navigation", { name: "Main navigation" });
}

async function expectLoggedOut(page: Page) {
  await expect(mainNav(page).getByRole("link", { name: "Login" })).toBeVisible();
  await expect(mainNav(page).getByRole("link", { name: "Register" })).toBeVisible();
  await expect(mainNav(page).getByRole("button", { name: "Logout" })).toHaveCount(0);
}

async function register(page: Page, email: string) {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Eve Tester");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
}

test("register → logged in → logout → logged out → login again", async ({ page }) => {
  const email = uniqueEmail();

  await page.goto("/");
  await expectLoggedOut(page);

  // Register and land on the homepage, authenticated.
  await register(page, email);
  await expect(page).toHaveURL("/");
  await expect(mainNav(page).getByRole("link", { name: "Hi, Eve" })).toBeVisible();
  await expect(mainNav(page).getByRole("link", { name: "Login" })).toHaveCount(0);

  // The session persists across navigation and reloads.
  await page.reload();
  await expect(mainNav(page).getByRole("link", { name: "Hi, Eve" })).toBeVisible();

  // The session cookie is HttpOnly and SameSite=Lax; in production it's also
  // Secure with the `__Host-` prefix.
  const session = (await page.context().cookies()).find((c) =>
    ["session", "__Host-session"].includes(c.name),
  );
  expect(session).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });
  if (session!.name === "__Host-session") expect(session!.secure).toBe(true);

  // A protected page is reachable while logged in.
  await mainNav(page).getByRole("link", { name: "Hi, Eve" }).click();
  await expect(page).toHaveURL("/profile");
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();

  // Logout invalidates the session.
  await mainNav(page).getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL("/");
  await expectLoggedOut(page);

  // Re-using the old cookie doesn't work: the server deleted the session.
  await page.context().addCookies([{ ...session!, expires: -1 }]);
  await page.goto("/profile");
  await expect(page).toHaveURL("/login?next=%2Fprofile");

  // Logging back in returns to the page that required it.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/profile");
  await expect(mainNav(page).getByRole("link", { name: "Hi, Eve" })).toBeVisible();
});

test("login rejects wrong credentials with a generic error", async ({ page }) => {
  const email = uniqueEmail();
  await register(page, email);
  await expect(page).toHaveURL("/");
  await mainNav(page).getByRole("button", { name: "Logout" }).click();
  await expectLoggedOut(page);

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("wrong-password1");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Invalid email or password.");
  await expect(page).toHaveURL("/login");
  await expectLoggedOut(page);
});

test("registering an existing email shows a duplicate-email error", async ({ browser }) => {
  const email = uniqueEmail();

  const first = await browser.newPage();
  await register(first, email);
  await expect(first).toHaveURL("/");
  await first.close();

  const second = await browser.newPage();
  await register(second, email);
  await expect(second.getByLabel("Email")).toHaveAccessibleDescription(
    "An account with this email already exists.",
  );
  await expect(second).toHaveURL("/register");
  await second.close();
});

test("protected pages redirect logged-out visitors to login", async ({ page }) => {
  for (const path of ["/profile", "/orders", "/wishlist", "/admin"]) {
    await page.goto(path);
    await expect(page).toHaveURL(`/login?next=${encodeURIComponent(path)}`);
  }
});

test("public pages stay public", async ({ page }) => {
  for (const path of [
    "/",
    "/products",
    "/products/1",
    "/search?q=arduino",
    "/ai-assistant",
    "/cart",
    "/checkout",
    "/custom-build",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page).toHaveURL(path);
  }
});
