"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useTranslation } from "./use-translation";

interface RulesModalProps {
  onClose: () => void;
  onWriteKudos: () => void;
}

interface HeroTierConfig {
  src: string;
  /** Proper noun — not translated */
  alt: string;
  rangeKey: "rules.hero.new.range" | "rules.hero.rising.range" | "rules.hero.super.range" | "rules.hero.legend.range";
  descKey: "rules.hero.new.description" | "rules.hero.rising.description" | "rules.hero.super.description" | "rules.hero.legend.description";
}

interface BadgeIcon {
  src: string;
  name: string;
}

const HERO_TIERS: HeroTierConfig[] = [
  {
    src: "/rules/hero-new.png",
    alt: "New Hero",
    rangeKey: "rules.hero.new.range",
    descKey: "rules.hero.new.description",
  },
  {
    src: "/rules/hero-rising.png",
    alt: "Rising Hero",
    rangeKey: "rules.hero.rising.range",
    descKey: "rules.hero.rising.description",
  },
  {
    src: "/rules/hero-super.png",
    alt: "Super Hero",
    rangeKey: "rules.hero.super.range",
    descKey: "rules.hero.super.description",
  },
  {
    src: "/rules/hero-legend.png",
    alt: "Legend Hero",
    rangeKey: "rules.hero.legend.range",
    descKey: "rules.hero.legend.description",
  },
];

const SECRET_BOX_BADGES: BadgeIcon[] = [
  { src: "/rules/badge-revival.png", name: "REVIVAL" },
  { src: "/rules/badge-touch-of-light.png", name: "TOUCH OF LIGHT" },
  { src: "/rules/badge-stay-gold.png", name: "STAY GOLD" },
  { src: "/rules/badge-flow-to-horizon.png", name: "FLOW TO HORIZON" },
  { src: "/rules/badge-beyond-the-boundary.png", name: "BEYOND THE BOUNDARY" },
  { src: "/rules/badge-root-further.png", name: "ROOT FURTHER" },
];

export function RulesModal({ onClose, onWriteKudos }: RulesModalProps) {
  const { t } = useTranslation();

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={t("rules.title")}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="font-montserrat relative z-10 flex h-full w-full max-w-[640px] flex-col bg-[#00070C] shadow-2xl">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-10 py-10">
          <h2 className="mb-6 text-3xl font-bold text-[#FFEA9E]">{t("rules.title")}</h2>

          {/* SECTION 1: Người nhận */}
          <section className="mb-8">
            <h3 className="mb-3 text-base font-bold uppercase leading-6 tracking-wide text-white">
              {t("rules.receivers.heading")}
            </h3>
            <p className="mb-5 text-sm leading-6 text-white/80">
              {t("rules.receivers.intro")}
            </p>

            <ul className="space-y-4">
              {HERO_TIERS.map((tier) => (
                <li key={tier.alt}>
                  <div className="mb-1 flex items-center gap-3">
                    <Image
                      src={tier.src}
                      alt={tier.alt}
                      width={88}
                      height={24}
                      className="h-6 w-auto shrink-0"
                    />
                    <span className="text-sm font-bold text-white">
                      {t(tier.rangeKey)}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-white/70">
                    {t(tier.descKey)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* SECTION 2: Người gửi */}
          <section className="mb-8">
            <h3 className="mb-3 text-base font-bold uppercase leading-6 tracking-wide text-white">
              {t("rules.senders.heading")}
            </h3>
            <p className="mb-6 text-sm leading-6 text-white/80">
              {t("rules.senders.intro")}
            </p>

            <div className="mb-6 grid grid-cols-3 gap-x-4 gap-y-6">
              {SECRET_BOX_BADGES.map((badge) => (
                <div
                  key={badge.name}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <Image
                    src={badge.src}
                    alt={badge.name}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-full object-cover"
                  />
                  <span className="text-xs font-bold uppercase leading-4 text-white">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm leading-6 text-white/80">
              {t("rules.senders.outro")}
            </p>
          </section>

          {/* SECTION 3: Quốc Dân */}
          <section>
            <h3 className="mb-3 text-base font-bold uppercase leading-6 tracking-wide text-white">
              {t("rules.national.heading")}
            </h3>
            <p className="text-sm leading-6 text-white/80">
              {t("rules.national.body")}
            </p>
          </section>
        </div>

        {/* Footer — sticky bar with Đóng + Viết KUDOS */}
        <div className="flex items-center gap-3 border-t border-white/10 bg-[#00070C] px-10 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-[#998C5F] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            <Image
              src="/widget/widget-close.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            {t("common.close")}
          </button>
          <button
            type="button"
            onClick={onWriteKudos}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FFEA9E] px-6 py-3 text-sm font-bold text-[#00101A] transition-opacity hover:brightness-95"
          >
            <Image
              src="/widget/widget-pen.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            {t("fab.write_kudos")}
          </button>
        </div>
      </div>
    </div>
  );
}
