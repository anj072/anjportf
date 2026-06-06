"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as tokenSystem from "@/tokens";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginCardProps = {
  logo?: React.ReactNode;
  onSubmit?: (values: LoginFormValues) => Promise<void> | void;
  forgotPasswordHref?: string;
};

type LoginStep = "email" | "password" | "success";

// Supports nested token objects without forcing a strict token type shape.
function getToken(path: string, fallback: string): string {
  const root = tokenSystem as Record<string, unknown>;
  const value = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), root);

  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function Spinner(): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="login-card__spinner"
      style={{
        width: 16,
        height: 16,
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: "currentColor",
        borderRightColor: "transparent",
        borderRadius: "999px",
      }}
    />
  );
}

function getEmailGreeting(email: string): string {
  const user = email.split("@")[0] ?? "";
  const clean = user.replace(/[._-]+/g, " ").trim();
  if (!clean) {
    return "Welcome back";
  }

  const pretty = clean
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return pretty ? `Hi ${pretty}` : "Welcome back";
}

export default function LoginCard({ logo, onSubmit, forgotPasswordHref = "#" }: LoginCardProps): React.JSX.Element {
  const [step, setStep] = React.useState<LoginStep>("email");
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  const submitHandler = React.useCallback(
    async (values: LoginFormValues) => {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await new Promise((resolve) => {
          setTimeout(resolve, 1000);
        });
      }

      setStep("success");
    },
    [onSubmit],
  );

  const continueToPassword = React.useCallback(
    (values: LoginFormValues) => {
      setSubmittedEmail(values.email);
      setStep("password");
    },
    [setSubmittedEmail, setStep],
  );

  const backToEmail = React.useCallback(() => {
    setStep("email");
  }, []);

  const paletteSurfaceElevated = getToken("color.surface.elevated", "var(--surface-elevated)");
  const paletteBorderInput = getToken("color.border.input", "var(--border-input)");
  const paletteTextPrimary = getToken("color.text.primary", "currentColor");
  const paletteTextMuted = getToken("color.text.muted", "inherit");
  const paletteError = getToken("color.feedback.error", "inherit");
  const paletteButtonPrimary = getToken("color.button.primary", "var(--button-primary)");
  const paletteButtonPrimaryText = getToken("color.button.primaryText", "var(--button-primary-text)");

  const radiusMd = getToken("radius.md", "20px");

  const headingLg = getToken("typography.heading.lg", "700 32px/40px \"SF Pro Display\", \"SF Pro Text\", -apple-system, sans-serif");
  const labelSm = getToken("typography.label.sm", "600 14px/16px \"SF Pro Text\", -apple-system, sans-serif");
  const bodySm = getToken("typography.body.sm", "400 14px/24px \"SF Pro Text\", -apple-system, sans-serif");

  return (
    <main
      className="login-card__page"
      style={{
        minHeight: "100dvh",
        fontFamily: '"SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(175, 215, 255, 0.45), transparent 60%), radial-gradient(900px 700px at 100% 100%, rgba(210, 234, 255, 0.65), transparent 62%), linear-gradient(180deg, #eef4ff 0%, #f8fbff 45%, #f3f6fc 100%)",
      }}
    >
      <div
        className="login-card__grid"
        style={{
          minHeight: "100dvh",
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          columnGap: 24,
          alignItems: "center",
          paddingInline: 80,
        }}
      >
        <Card
          className="login-card__card"
          style={{
            gridColumn: "5 / span 4",
            width: "100%",
            maxWidth: 480,
            justifySelf: "center",
            background: `color-mix(in oklab, ${paletteSurfaceElevated} 88%, white 12%)`,
            borderRadius: radiusMd,
            padding: 32,
            border: `1px solid color-mix(in oklab, ${paletteBorderInput} 60%, white 40%)`,
            boxShadow: "0 24px 64px rgba(19, 41, 74, 0.16)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Form {...form}>
            <form onSubmit={step === "password" ? handleSubmit(submitHandler) : undefined} noValidate>
              <div className="login-card__stack" style={{ display: "grid", gap: 24 }}>
                {logo ? <div>{logo}</div> : null}

                <div className="login-card__progress" aria-hidden="true" style={{ display: "flex", gap: 8 }}>
                  <span className={`login-card__dot ${step === "email" ? "is-active" : ""}`} />
                  <span className={`login-card__dot ${step === "password" ? "is-active" : ""}`} />
                  <span className={`login-card__dot ${step === "success" ? "is-active" : ""}`} />
                </div>

                {step === "email" ? (
                  <>
                    <header className="login-card__step" style={{ display: "grid", gap: 8 }}>
                      <h1 style={{ margin: 0, font: headingLg, color: paletteTextPrimary }}>Welcome back</h1>
                      <p style={{ margin: 0, font: bodySm, color: paletteTextMuted }}>
                        Enter your email to continue to your fitness challenge.
                      </p>
                    </header>

                    <div className="login-card__step" style={{ display: "grid", gap: 16 }}>
                      <div style={{ display: "grid", gap: 8 }}>
                        <Label htmlFor="email" style={{ font: labelSm, color: paletteTextPrimary }}>
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          aria-invalid={Boolean(errors.email)}
                          {...register("email", {
                            required: "Email is required.",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Enter a valid email address.",
                            },
                          })}
                          style={{
                            height: 56,
                            borderColor: errors.email ? paletteError : paletteBorderInput,
                            borderRadius: radiusMd,
                            transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
                          }}
                        />
                        {errors.email ? (
                          <p role="alert" style={{ margin: 0, font: bodySm, color: paletteError }}>
                            {errors.email.message}
                          </p>
                        ) : null}
                      </div>

                      <Button
                        type="button"
                        onClick={() => {
                          void handleSubmit(continueToPassword)();
                        }}
                        className="login-card__button"
                        style={{
                          width: "100%",
                          height: 56,
                          borderRadius: radiusMd,
                          transition: "all 150ms ease-out",
                          background: paletteButtonPrimary,
                          color: paletteButtonPrimaryText,
                        }}
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                ) : null}

                {step === "password" ? (
                  <>
                    <div className="login-card__step" style={{ display: "grid", gap: 16 }}>
                      <button
                        type="button"
                        className="login-card__back"
                        onClick={backToEmail}
                        style={{
                          justifySelf: "start",
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          font: bodySm,
                          color: paletteTextMuted,
                          cursor: "pointer",
                          transition: "opacity 150ms ease-out",
                        }}
                      >
                        ← Change email
                      </button>

                      <header style={{ display: "grid", gap: 8 }}>
                        <h1 style={{ margin: 0, font: headingLg, color: paletteTextPrimary }}>
                          {getEmailGreeting(submittedEmail || getValues("email"))}
                        </h1>
                        <p style={{ margin: 0, font: bodySm, color: paletteTextMuted }}>
                          Enter your password to sign in.
                        </p>
                      </header>
                    </div>

                    <div className="login-card__step" style={{ display: "grid", gap: 16 }}>
                      <div style={{ display: "grid", gap: 8 }}>
                        <Label htmlFor="password" style={{ font: labelSm, color: paletteTextPrimary }}>
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          aria-invalid={Boolean(errors.password)}
                          {...register("password", {
                            required: "Password is required.",
                          })}
                          style={{
                            height: 56,
                            borderColor: errors.password ? paletteError : paletteBorderInput,
                            borderRadius: radiusMd,
                            transition: "border-color 150ms ease-out, box-shadow 150ms ease-out",
                          }}
                        />
                        {errors.password ? (
                          <p role="alert" style={{ margin: 0, font: bodySm, color: paletteError }}>
                            {errors.password.message}
                          </p>
                        ) : null}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className="login-card__button"
                        style={{
                          width: "100%",
                          height: 56,
                          borderRadius: radiusMd,
                          transition: "all 150ms ease-out",
                          background: paletteButtonPrimary,
                          color: paletteButtonPrimaryText,
                        }}
                      >
                        {isSubmitting ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <Spinner />
                            <span>Signing in...</span>
                          </span>
                        ) : (
                          "Sign in"
                        )}
                      </Button>

                      <a
                        href={forgotPasswordHref}
                        className="login-card__forgot"
                        style={{
                          justifySelf: "end",
                          font: bodySm,
                          color: paletteTextMuted,
                          transition: "color 150ms ease-out, opacity 150ms ease-out",
                        }}
                      >
                        Forgot password?
                      </a>
                    </div>
                  </>
                ) : null}

                {step === "success" ? (
                  <div className="login-card__step" style={{ display: "grid", gap: 16, justifyItems: "center" }}>
                    <div
                      aria-hidden="true"
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "999px",
                        display: "grid",
                        placeItems: "center",
                        background: "color-mix(in oklab, white 72%, transparent)",
                        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.6)",
                        fontSize: 28,
                      }}
                    >
                      ✓
                    </div>
                    <header style={{ display: "grid", gap: 8, textAlign: "center" }}>
                      <h1 style={{ margin: 0, font: headingLg, color: paletteTextPrimary }}>You are in</h1>
                      <p style={{ margin: 0, font: bodySm, color: paletteTextMuted }}>
                        Ready for day one of your challenge.
                      </p>
                    </header>
                  </div>
                ) : null}
              </div>
            </form>
          </Form>
        </Card>
      </div>

      <style jsx>{`
        .login-card__spinner {
          animation: login-card-spin 800ms linear infinite;
        }

        .login-card__step {
          animation: login-card-rise 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .login-card__dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: color-mix(in oklab, ${paletteTextMuted} 35%, transparent);
          transition: all 150ms ease-out;
        }

        .login-card__dot.is-active {
          width: 24px;
          background: color-mix(in oklab, ${paletteTextPrimary} 70%, transparent);
        }

        .login-card__button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .login-card__back:hover,
        .login-card__back:focus-visible,
        .login-card__forgot:hover,
        .login-card__forgot:focus-visible {
          opacity: 0.78;
        }

        .login-card__button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(12, 58, 116, 0.28);
        }

        @media (max-width: 1200px) {
          .login-card__grid {
            padding-inline: 48px;
          }

          .login-card__card {
            grid-column: 4 / span 6;
          }
        }

        @media (max-width: 900px) {
          .login-card__grid {
            padding-inline: 24px;
            column-gap: 24px;
          }

          .login-card__card {
            grid-column: 2 / span 10;
            padding: 24px;
          }
        }

        @media (max-width: 640px) {
          .login-card__grid {
            padding-inline: 16px;
            column-gap: 16px;
          }

          .login-card__card {
            grid-column: 1 / span 12;
            padding: 24px;
          }
        }

        @keyframes login-card-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes login-card-rise {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
