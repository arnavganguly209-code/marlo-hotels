/**
 * Official-style payment brand marks for the footer.
 * Equal white cards · logos fill ~80% · Hyatt/JW Marriott scale.
 */

function VisaLogo() {
  return (
    <svg viewBox="0 0 70 24" className="h-[70%] w-[82%]" aria-hidden>
      <text
        x="35"
        y="18"
        textAnchor="middle"
        fill="#1A1F71"
        fontFamily="Arial Narrow, Arial, Helvetica, sans-serif"
        fontSize="20"
        fontWeight="800"
        fontStyle="italic"
        letterSpacing="-1.2"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 40 24" className="h-[82%] w-[82%]" aria-hidden>
      <circle cx="15" cy="12" r="10" fill="#EB001B" />
      <circle cx="25" cy="12" r="10" fill="#F79E1B" />
      <path
        d="M20 4.4a10 10 0 0 1 0 15.2 10 10 0 0 1 0-15.2Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 48 24" className="h-[82%] w-[88%]" aria-hidden>
      <rect width="48" height="24" rx="2" fill="#016FD0" />
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.8"
      >
        AMEX
      </text>
    </svg>
  );
}

function AlipayLogo() {
  return (
    <svg viewBox="0 0 56 24" className="h-[82%] w-[88%]" aria-hidden>
      <rect width="56" height="24" rx="2" fill="#1677FF" />
      <text
        x="28"
        y="15.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="10"
        fontWeight="700"
        letterSpacing="0.2"
      >
        Alipay
      </text>
    </svg>
  );
}

function UnionPayLogo() {
  return (
    <svg viewBox="0 0 56 24" className="h-[82%] w-[88%]" aria-hidden>
      <rect x="0.5" y="1.5" width="17" height="21" rx="1.5" fill="#E21836" />
      <rect x="19.5" y="1.5" width="17" height="21" rx="1.5" fill="#00447C" />
      <rect x="38.5" y="1.5" width="17" height="21" rx="1.5" fill="#007B84" />
      <text
        x="9"
        y="15"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="7"
        fontWeight="700"
      >
        银联
      </text>
      <text
        x="28"
        y="15"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="6"
        fontWeight="700"
      >
        Union
      </text>
      <text
        x="47"
        y="15"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="6"
        fontWeight="700"
      >
        Pay
      </text>
    </svg>
  );
}

const MARKS = [
  { name: "Visa", Logo: VisaLogo },
  { name: "Mastercard", Logo: MastercardLogo },
  { name: "American Express", Logo: AmexLogo },
  { name: "Alipay", Logo: AlipayLogo },
  { name: "UnionPay", Logo: UnionPayLogo },
] as const;

export function PaymentMarks({ className }: { className?: string }) {
  return (
    <ul
      className={className ?? "mt-6 flex flex-wrap items-center gap-2"}
      aria-label="Accepted payment methods"
    >
      {MARKS.map(({ name, Logo }) => (
        <li key={name}>
          <span
            title={name}
            className="flex h-8 w-[3.35rem] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white shadow-[0_1px_3px_rgb(0_0_0_/_0.2)] sm:h-9 sm:w-14"
          >
            <Logo />
            <span className="sr-only">{name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
