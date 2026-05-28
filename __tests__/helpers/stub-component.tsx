import type { ReactNode } from "react";

type AnyProps = Record<string, unknown> & { children?: ReactNode };

/**
 * Build a sync stub for an async server component.
 * Renders a div with `data-testid={name}`; flags props as data-* attributes
 * so tests can assert which props were passed (without rendering the real tree).
 */
export function stub(name: string) {
  function Stub({ children, ...rest }: AnyProps) {
    const dataProps: Record<string, string> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value == null) continue;
      dataProps[`data-prop-${key.toLowerCase()}`] =
        typeof value === "object" ? "object" : String(value);
    }
    return (
      <div data-testid={name} {...dataProps}>
        {children}
      </div>
    );
  }
  Stub.displayName = `Stub(${name})`;
  return Stub;
}
