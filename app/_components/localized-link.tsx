"use client";

import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { DEFAULT_LANGUAGE, LANGUAGE_PARAM, type Language } from "@/lib/i18n";
import { useLanguage } from "./language-context";

type LocalizedLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: ReactNode;
  };

/**
 * Drop-in `<Link>` replacement that auto-appends `?lang=` to internal hrefs
 * when the active language is non-default. External hrefs (`http(s)://...`,
 * `mailto:`, `tel:`, plain `#anchor`) are passed through unchanged.
 */
export function LocalizedLink({ href, ...rest }: LocalizedLinkProps) {
  const language = useLanguage();
  const finalHref = withLanguageParam(href, language);
  return <NextLink href={finalHref} {...rest} />;
}

function withLanguageParam(
  href: LinkProps["href"],
  language: Language,
): LinkProps["href"] {
  if (language === DEFAULT_LANGUAGE) return href;
  if (typeof href !== "string") return href;
  if (!href.startsWith("/")) return href; // external or anchor-only

  // Split off the hash so we insert the query param before it.
  const hashIndex = href.indexOf("#");
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const base = hashIndex >= 0 ? href.slice(0, hashIndex) : href;

  const separator = base.includes("?") ? "&" : "?";
  // Don't append a duplicate `lang=` if the caller already set one.
  if (base.includes(`${LANGUAGE_PARAM}=`)) return href;

  return `${base}${separator}${LANGUAGE_PARAM}=${language}${hash}`;
}
