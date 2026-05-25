import Image from "next/image";
import LoginHeader from "./_components/login-header";
import GoogleLoginButton from "./_components/google-login-button";
import LoginErrorBanner from "./_components/login-error-banner";
import RootFurtherWordmark from "./_components/root-further-wordmark";
import { loginWithGoogle } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * /login — Login screen (server component).
 *
 * Design ref: MoMorph "Login" frame
 *   fileKey: 9ypp4enmFmdK3YAFJLIu6C | screenId: GzbNeVGJHz
 *
 * Layout (from design node 662:14393 mms_B_Bìa):
 *   - Full-viewport bg: bg-keyvisual.png (1440×1024), artwork visible on right half.
 *   - Dark gradient mask (from-[#0A0E1B]/95 left → transparent right) hides baked-in
 *     hero content in the PNG and provides clean dark surface for overlay components.
 *   - Hero content (ROOT FURTHER + welcome text + button) is left-aligned,
 *     vertically centered, mirroring design x=144 padding (10vw on desktop).
 *   - Design frame padding: 96px top/bottom, 144px left/right (10% of 1440px).
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorCode =
    typeof params.error === "string" ? params.error : undefined;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* ── Fixed header (z-50) ── */}
      <LoginHeader />

      {/* ── Background layer (absolute, z-0) ── */}
      {/* Full-frame Figma render: bg-keyvisual.png.
          Gradient mask: solid dark on left (hides baked-in hero text in PNG),
          fades to transparent on right (preserves artwork). */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <Image
          src="/login/bg-keyvisual.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* DO NOT REMOVE — masks the baked-in Figma UI (ROOT FURTHER text + button
            + footer) inside bg-keyvisual.png. Without this gradient those elements
            ghost through behind the overlay components on the left half of the
            viewport. */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0A0E1B]/95 from-30% via-[#0A0E1B]/60 via-55% to-transparent to-75%" />
      </div>

      {/* ── Main content (z-10, full-height, left-aligned) ── */}
      {/* Design: mms_B_Bìa padding 96px 144px, hero vertically centered.
          On mobile: centered layout for narrower viewports. */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 md:items-start md:px-[10vw] lg:px-36">
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center md:max-w-none md:items-start md:text-left">

          {/* ROOT FURTHER key visual — mms_B.1_Key Visual (2939:9548).
              Design container: 1152px wide. Scale generously on desktop. */}
          <RootFurtherWordmark />

          {/* Welcome text — mms_B.2_content (662:14753).
              Design: Montserrat Bold 20px, white, left-aligned, 40px line-height. */}
          <p
            className="font-montserrat font-bold text-white md:text-left"
            style={{
              fontSize: "20px",
              lineHeight: "40px",
              letterSpacing: "0.5px",
            }}
          >
            Bắt đầu hành trình của bạn cùng SAA 2025.
            <br />
            Đăng nhập để khám phá!
          </p>

          {/* Error banner — rendered when ?error=<code> is present in URL */}
          {errorCode && <LoginErrorBanner errorCode={errorCode} />}

          {/* Google login button — mms_B.3_Login (662:14425).
              Button-IC About (662:14426): cream/yellow bg, dark navy text, Google G icon right. */}
          <GoogleLoginButton action={loginWithGoogle} />
        </div>
      </main>

      {/* ── Footer (absolute bottom, z-10) ── */}
      {/* Design node: mms_D_Footer > "Bản quyền thuộc về Sun* © 2025" */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center pb-6">
        <p className="text-xs text-white/50">
          Bản quyền thuộc về Sun* © 2025
        </p>
      </footer>
    </div>
  );
}
