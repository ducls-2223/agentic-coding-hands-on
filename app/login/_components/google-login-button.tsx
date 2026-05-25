/**
 * Google Login button — submit button inside a form.
 *
 * Design ref: mms_B.3_Login (node 662:14425)
 *   Button-IC About (662:14426): bg rgba(255,234,158,1), text rgba(0,16,26,1)
 *   Layout: text left, Google G icon right (305×60px, borderRadius 8px, padding 16px 24px)
 *   Text: "LOGIN With Google" — Montserrat Bold 22px
 *
 * Integration contract: form action is passed as prop so phase 05 can swap the server action.
 */

import Image from "next/image";

interface GoogleLoginButtonProps {
  /** Server action bound to the form. */
  action: () => void | Promise<void>;
}

export default function GoogleLoginButton({ action }: GoogleLoginButtonProps) {
  return (
    <form action={action} className="w-full max-w-[305px]">
      <button
        type="submit"
        className="flex w-full items-center justify-between gap-2 rounded-lg px-6 py-4 font-bold text-[#00101A] shadow-md transition-all duration-200 hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        style={{
          backgroundColor: "#FFEA9E",
          height: "60px",
          borderRadius: "8px",
          padding: "16px 24px",
        }}
      >
        {/* Text: left side — Montserrat Bold 22px per design node I662:14426;186:1568 */}
        <span
          className="font-montserrat shrink-0 font-bold leading-7 tracking-normal"
          style={{ fontSize: "22px" }}
        >
          LOGIN With Google
        </span>
        {/* Google G icon: right side — 24×24 per design node I662:14426;186:1766 */}
        <Image
          src="/login/google-g.svg"
          alt=""
          width={24}
          height={24}
          aria-hidden="true"
          className="shrink-0"
        />
      </button>
    </form>
  );
}
