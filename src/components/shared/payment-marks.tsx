/** Compact official-style payment marks for the footer. */

export function VisaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      role="img"
      aria-label="Visa"
    >
      <title>Visa</title>
      <text
        x="0"
        y="13"
        fill="#1A1F71"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.5"
      >
        VISA
      </text>
    </svg>
  );
}

export function MastercardMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 22"
      className={className}
      role="img"
      aria-label="Mastercard"
    >
      <title>Mastercard</title>
      <circle cx="13" cy="11" r="9" fill="#EB001B" />
      <circle cx="23" cy="11" r="9" fill="#F79E1B" />
      <path
        d="M18 4.2a9 9 0 0 1 0 13.6 9 9 0 0 1 0-13.6Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function AmexMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      role="img"
      aria-label="American Express"
    >
      <title>American Express</title>
      <rect width="48" height="16" rx="2" fill="#2E77BB" />
      <text
        x="24"
        y="11.5"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="7"
        fontWeight="700"
        letterSpacing="0.6"
      >
        AMEX
      </text>
    </svg>
  );
}

export function UnionPayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 16"
      className={className}
      role="img"
      aria-label="UnionPay"
    >
      <title>UnionPay</title>
      <rect x="0" y="1" width="14" height="14" rx="1" fill="#E21836" />
      <rect x="14" y="1" width="14" height="14" rx="1" fill="#00447C" />
      <rect x="28" y="1" width="14" height="14" rx="1" fill="#007B84" />
      <text
        x="7"
        y="11"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5.5"
        fontWeight="700"
      >
        UP
      </text>
      <text
        x="21"
        y="11"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5.5"
        fontWeight="700"
      >
        UP
      </text>
      <text
        x="35"
        y="11"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5.5"
        fontWeight="700"
      >
        UP
      </text>
    </svg>
  );
}

export function PaymentMarks({ className }: { className?: string }) {
  return (
    <ul
      className={className}
      aria-label="Accepted payment methods"
    >
      <li className="flex h-7 w-11 items-center justify-center rounded border border-ivory/10 bg-ivory/95 px-1.5">
        <VisaMark className="h-3.5 w-auto" />
      </li>
      <li className="flex h-7 w-11 items-center justify-center rounded border border-ivory/10 bg-ivory/95 px-1">
        <MastercardMark className="h-4 w-auto" />
      </li>
      <li className="flex h-7 w-11 items-center justify-center rounded border border-ivory/10 bg-ivory/95 px-1">
        <AmexMark className="h-3.5 w-auto" />
      </li>
      <li className="flex h-7 w-11 items-center justify-center rounded border border-ivory/10 bg-ivory/95 px-1">
        <UnionPayMark className="h-3.5 w-auto" />
      </li>
    </ul>
  );
}
