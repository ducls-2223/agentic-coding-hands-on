import Image from "next/image";
import { LocalizedLink as Link } from "./localized-link";

interface FooterProps {
  /** Pathname of the current route; used to highlight the active footer link. */
  activePath?: string;
}

const FOOTER_LINKS = [
  { label: "About SAA 2025", href: "/" },
  { label: "Awards Information", href: "/awards-information" },
  { label: "Sun* Kudos", href: "/sun-kudos" },
];

export function HomeFooter({ activePath = "/" }: FooterProps) {
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
          Bản quyền thuộc về Sun* © 2025
        </p>
      </div>
    </footer>
  );
}
