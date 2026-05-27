import Image from "next/image";
import { LocalizedLink as Link } from "./localized-link";
import { getLanguage } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/t";

interface FooterProps {
  /** Pathname of the current route; used to highlight the active footer link. */
  activePath?: string;
}

export async function HomeFooter({ activePath = "/" }: FooterProps) {
  const language = await getLanguage();

  const FOOTER_LINKS = [
    { label: t(language, "nav.about_saa"), href: "/" },
    { label: t(language, "nav.awards_information"), href: "/awards-information" },
    { label: t(language, "nav.sun_kudos"), href: "/sun-kudos" },
  ];
  return (
    <footer className="w-full border-t border-[#2E3940] bg-[#0A0E1B]">
      <div className="mx-auto flex max-w-[1512px] items-center justify-between px-[90px] py-10">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-20">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/home/footer-logo.png"
              alt="SAA Logo"
              width={69}
              height={64}
            />
          </Link>

          <nav className="flex items-center gap-12">
            {FOOTER_LINKS.map((link) => {
              const active = link.href === activePath;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "font-montserrat rounded bg-[rgba(255,234,158,0.10)] px-4 py-4 text-base font-bold text-[#FFEA9E]"
                      : "font-montserrat px-4 py-4 text-base font-bold text-white transition-colors hover:text-[#FFEA9E]"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: copyright */}
        <p className="font-montserrat text-base font-bold text-white">
          {t(language, "footer.copyright_alt")}
        </p>
      </div>
    </footer>
  );
}
