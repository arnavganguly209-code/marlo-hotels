import Image from "next/image";

export default function Loading() {
  return (
    <div className="grid min-h-svh place-items-center bg-forest-950">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/images/brand/logo.png"
          alt="Marlo Hotels"
          width={918}
          height={330}
          priority
          className="h-14 w-auto animate-pulse object-contain md:h-16"
        />
        <span className="h-px w-24 animate-pulse bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
      </div>
    </div>
  );
}
