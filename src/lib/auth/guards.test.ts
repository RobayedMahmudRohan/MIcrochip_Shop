// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionUser } from "@/lib/auth/session";

const state = vi.hoisted(() => ({ user: null as SessionUser | null }));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => state.user }));
vi.mock("next/navigation", async () => {
  const { RedirectSignal, NotFoundSignal } = await import("@/test/auth-fakes");
  return {
    redirect: (url: string) => {
      throw new RedirectSignal(url);
    },
    notFound: () => {
      throw new NotFoundSignal();
    },
  };
});

const { NotFoundSignal, RedirectSignal } = await import("@/test/auth-fakes");
const { requireAdmin, requireUser } = await import("@/lib/auth/guards");

beforeEach(() => {
  state.user = null;
});

describe("requireUser", () => {
  it("redirects signed-out visitors to login with a return path", async () => {
    await expect(requireUser("/orders/7")).rejects.toThrow(RedirectSignal);
    await expect(requireUser("/orders/7")).rejects.toMatchObject({
      url: "/login?next=%2Forders%2F7",
    });
  });

  it("returns the signed-in user", async () => {
    state.user = { id: 1, name: "Ada", role: "customer" };
    await expect(requireUser("/profile")).resolves.toEqual(state.user);
  });
});

describe("requireAdmin", () => {
  it("redirects signed-out visitors to login", async () => {
    await expect(requireAdmin("/admin")).rejects.toMatchObject({ url: "/login?next=%2Fadmin" });
  });

  it("hides admin pages from customers with a 404", async () => {
    state.user = { id: 1, name: "Ada", role: "customer" };
    await expect(requireAdmin("/admin")).rejects.toThrow(NotFoundSignal);
  });

  it("allows admins", async () => {
    state.user = { id: 2, name: "Grace", role: "admin" };
    await expect(requireAdmin("/admin")).resolves.toEqual(state.user);
  });
});
