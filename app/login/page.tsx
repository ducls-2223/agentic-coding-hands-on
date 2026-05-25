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
 * Background note: MoMorph node 662:14389 is a RECTANGLE with an embedded
 * image fill. Its asset URL is NOT exposed via the media-files API, so the
 * decorative background is rendered as a CSS gradient stand-in. The header
 * and hero PNGs (logo, ROOT FURTHER) are real MoMorph exports under
 * public/login/.
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
      {/* Stand-in for mms_C_Keyvisual > image 1 (662:14389). The image fill
          on that RECTANGLE is not exported by MoMorph's media-files API. */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-emerald-950 to-slate-800" />
        {/* Dark overlay mirrors Rectangle 57 + Cover nodes for text legibility */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ── Main content (z-10, full-height centered) ── */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center md:max-w-md">

          {/* ROOT FURTHER key visual — mms_B.1_Key Visual (2939:9548) */}
          <RootFurtherWordmark />

          {/* Vietnamese welcome text */}
          {/* Design node: mms_B.2_content (662:14753) */}
          <p className="text-base font-medium leading-relaxed text-white/90 md:text-lg">
            Bắt đầu hành trình của bạn cùng SAA 2025.
            <br />
            Đăng nhập để khám phá!
          </p>

          {/* Error banner — rendered when ?error=<code> is present in URL */}
          {errorCode && <LoginErrorBanner errorCode={errorCode} />}

          {/* Google login button */}
          {/* Design node: mms_B.3_Login (662:14425) */}
          <GoogleLoginButton action={loginWithGoogle} />
        </div>
      </main>

      {/* ── Footer (absolute bottom, z-10) ── */}
      {/* Design node: mms_D_Footer > "Bản quyền thuộc về Sun* © 2025" (I662:14447;342:1413) */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center pb-6">
        <p className="text-xs text-white/50">
          Bản quyền thuộc về Sun* © 2025
        </p>
      </footer>
    </div>
  );
}
