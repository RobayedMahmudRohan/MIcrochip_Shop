import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register-form";
import { register } from "@/lib/auth/actions";

vi.mock("@/lib/auth/actions", () => ({ register: vi.fn(), login: vi.fn() }));

const registerMock = vi.mocked(register);

async function fillForm(values: Partial<Record<"name" | "email" | "password" | "confirm", string>>) {
  const user = userEvent.setup();
  const { name = "Ada Lovelace", email = "ada@example.com", password = "engine1843" } = values;
  const confirm = values.confirm ?? password;

  if (name) await user.type(screen.getByLabelText("Name"), name);
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Password"), password);
  if (confirm) await user.type(screen.getByLabelText("Confirm password"), confirm);
  return user;
}

beforeEach(() => {
  registerMock.mockReset();
  registerMock.mockResolvedValue({});
});

describe("RegisterForm", () => {
  it("renders labelled fields and a submit button", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Name")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByLabelText("Confirm password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Create account" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  it("shows accessible errors for empty fields and does not submit", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();

    const name = screen.getByLabelText("Name");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Name is required.");
    expect(name).toHaveFocus();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    render(<RegisterForm />);
    const user = await fillForm({ email: "not-an-email" });

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter a valid email address.",
    );
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("rejects a password confirmation that doesn't match", async () => {
    render(<RegisterForm />);
    const user = await fillForm({ confirm: "engine1844" });

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByLabelText("Confirm password")).toHaveAccessibleDescription(
      "Passwords do not match.",
    );
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("submits valid data, including the return path, to the server action", async () => {
    render(<RegisterForm next="/wishlist" />);
    const user = await fillForm({});

    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(registerMock).toHaveBeenCalledTimes(1);
    const formData = registerMock.mock.calls[0][1];
    expect(Object.fromEntries(formData)).toEqual({
      next: "/wishlist",
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "engine1843",
      confirmPassword: "engine1843",
    });
  });

  it("shows the server's duplicate-email error and keeps the entered details", async () => {
    registerMock.mockResolvedValue({
      errors: { email: "An account with this email already exists." },
      fields: { name: "Ada Lovelace", email: "ada@example.com" },
    });
    render(<RegisterForm />);
    const user = await fillForm({});

    await user.click(screen.getByRole("button", { name: "Create account" }));

    const email = await screen.findByLabelText("Email");
    expect(email).toHaveAccessibleDescription("An account with this email already exists.");
    expect(email).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
  });

  it("disables the button while the account is being created", async () => {
    registerMock.mockReturnValue(new Promise(() => {}));
    render(<RegisterForm />);
    const user = await fillForm({});

    await user.click(screen.getByRole("button", { name: "Create account" }));

    const button = await screen.findByRole("button", { name: "Creating account…" });
    expect(button).toBeDisabled();
  });
});
