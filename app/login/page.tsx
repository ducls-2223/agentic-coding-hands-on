import Image from "next/image";
import LoginHeader from "./_components/login-header";
import GoogleLoginButton from "./_components/google-login-button";
import LoginErrorBanner from "./_components/login-error-banner";
import RootFurtherWordmark from "./_components/root-further-wordmark";
import { loginWithGoogle } from "./actions";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

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
  const errorCode = typeof params.error === "string" ? params.error : undefined;
  const lang = await getLanguage();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* ── Fixed header (z-50) ── */}
      <LoginHeader />

      {/* ── Background layer (absolute, z-0) ── */}
      {/* Composition matching the Figma design:
          1. Outer wrapper paints solid `#0A0E1B` across the whole viewport.
          2. The artwork-only PNG (bg-keyvisual.png, 1440×547 — aspect 2.63:1,
             NO baked-in UI). The PNG already contains a dark-navy left edge
             that blends with the wrapper, with the colorful swirls
             concentrated on the right ~60%.
          3. `object-contain` keeps the PNG at its natural aspect ratio —
             never stretched, never aggressively cropped — letterboxed top
             and bottom with the dark wrapper showing through. This matches
             the Figma frame where the artwork sits as a horizontal band in
             the vertical center, surrounded by solid dark navy.
          4. A subtle left-side gradient softens any visible seam where the
             PNG's left edge meets the wrapper. */}
      <div className="absolute inset-0 z-0 bg-[#0A0E1B]" aria-hidden="true">
        <Image
          src="/login/bg-keyvisual.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Design composition: artwork dominates the right side and extends
            top-to-bottom; the left ~45% stays solid dark for ROOT FURTHER +
            welcome copy + LOGIN button contrast. The mask holds opaque navy
            over 0–30%, fades through 30–55%, and lets the colorful right
            half show crisp from 55% onward. */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0A0E1B] from-0% via-[#0A0E1B]/80 via-30% to-transparent to-55%" />
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
            {t(lang, "login.welcome.body")}
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
          {t(lang, "footer.copyright_alt")}
        </p>
      </footer>
    </div>
  );
}
