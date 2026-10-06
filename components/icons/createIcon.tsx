import type { SVGProps } from "react";

/* Atlas icons are 24px stroked line icons. Stroke widths follow the Atlas weights
   (thin 1, medium 1.5, bold 2) and colour is currentColor, so an icon takes the
   colour of its text. Icons are decorative by default; pass `label` when the icon
   is the only thing that says what something is. */

export type IconWeight = "thin" | "medium" | "bold";
export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  size?: number | string;
  weight?: IconWeight;
  label?: string;
};

const STROKE: Record<IconWeight, number> = { thin: 1, medium: 1.5, bold: 2 };

export function createIcon(name: string, markup: string) {
  function Icon({ size = 24, weight = "medium", label, ...props }: IconProps) {
    const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeMiterlimit={10}
        strokeWidth={STROKE[weight]}
        focusable="false"
        {...a11y}
        {...props}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }
  Icon.displayName = `${name}Icon`;
  return Icon;
}
