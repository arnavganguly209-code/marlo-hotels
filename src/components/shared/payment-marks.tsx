import { withMediaCacheBust } from "@/lib/media-cache";

export const PAYMENT_METHODS = [
  { key: "visa", label: "Visa", defaultSrc: "/images/payments/visa.svg" },
  {
    key: "mastercard",
    label: "Mastercard",
    defaultSrc: "/images/payments/mastercard.svg",
  },
  {
    key: "amex",
    label: "American Express",
    defaultSrc: "/images/payments/amex.svg",
  },
  { key: "alipay", label: "Alipay", defaultSrc: "/images/payments/alipay.svg" },
  {
    key: "unionpay",
    label: "UnionPay",
    defaultSrc: "/images/payments/unionpay.svg",
  },
] as const;

export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]["key"];

export type PaymentLogoMark = {
  key: PaymentMethodKey;
  label: string;
  src: string;
  assetId?: string | null;
  version?: number;
};

export function PaymentMarks({
  className,
  logos,
}: {
  className?: string;
  logos?: PaymentLogoMark[];
}) {
  const marks =
    logos?.length === PAYMENT_METHODS.length
      ? logos
      : PAYMENT_METHODS.map((item) => ({
          key: item.key,
          label: item.label,
          src: item.defaultSrc,
          version: 1,
        }));

  return (
    <ul
      className={
        className ??
        "mt-6 grid w-full max-w-[34rem] grid-cols-5 gap-2.5 sm:max-w-xl sm:gap-3"
      }
      aria-label="Accepted payment methods"
    >
      {marks.map((mark) => {
        const src = withMediaCacheBust(mark.src, mark.version);
        return (
          <li key={mark.key} className="min-w-0">
            <span
              title={mark.label}
              className="flex aspect-[1.65/1] w-full items-center justify-center overflow-hidden rounded-[10px] border border-white/25 bg-white p-[6%] shadow-[0_1px_2px_rgb(0_0_0_/_0.08),0_4px_12px_rgb(0_0_0_/_0.12)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={mark.label}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
