import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrbitLoginForm } from "@/components/orbit/login-form";
import { getOrbitSession } from "@/lib/orbit/auth";
import { isNextNavigationError } from "@/lib/orbit/logger";
import { getBrandSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const particles = [
  ["8%", "18%", "0s", "5px"],
  ["18%", "76%", "1.1s", "3px"],
  ["31%", "29%", "2.2s", "4px"],
  ["43%", "86%", ".6s", "6px"],
  ["55%", "14%", "3.1s", "3px"],
  ["64%", "63%", "1.7s", "5px"],
  ["73%", "31%", ".2s", "3px"],
  ["82%", "81%", "2.7s", "4px"],
  ["92%", "20%", "1.4s", "5px"],
] as const;

export default async function OrbitLoginPage() {
  try {
    if (await getOrbitSession()) redirect("/orbit/dashboard");
  } catch (error) {
    if (isNextNavigationError(error)) throw error;
  }

  const brand = await getBrandSettings().catch(() => ({
    logoUrl: "/images/brand/logo.png",
    footerLogoUrl: "/images/brand/logo.png",
    faviconUrl: "/images/brand/logo.png",
  }));

  return (
    <section className="orbit-login-bg relative grid min-h-svh place-items-center overflow-hidden px-5 py-12">
      <div className="orbit-aurora absolute inset-0" aria-hidden="true" />
      <div
        className="absolute top-[-25%] left-[-15%] size-[48rem] rounded-full bg-[#275e52]/18 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute right-[-20%] bottom-[-35%] size-[52rem] rounded-full bg-[#c7963e]/12 blur-[140px]"
        aria-hidden="true"
      />
      {particles.map(([left, top, delay, size]) => (
        <span
          key={`${left}-${top}`}
          aria-hidden="true"
          className="orbit-particle absolute rounded-full bg-[#e1bd71]/60 shadow-[0_0_14px_#d0a654]"
          style={{ left, top, animationDelay: delay, width: size, height: size }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[440px]">
        <div className="orbit-login-card rounded-[28px] border border-white/12 px-7 py-9 shadow-[0_35px_90px_-20px_rgba(0,0,0,.8)] backdrop-blur-2xl sm:px-10 sm:py-11">
          <div className="text-center">
            <Image
              src={brand.logoUrl}
              alt="Marlo Hotels"
              width={380}
              height={150}
              priority
              className="mx-auto h-auto w-48 object-contain"
            />
            <div className="mx-auto mt-7 h-px w-20 bg-gradient-to-r from-transparent via-[#d0a654] to-transparent" />
            <p className="mt-6 text-[10px] font-medium tracking-[0.38em] text-[#d0a654] uppercase">
              Enterprise Administration
            </p>
            <h1 className="font-display mt-3 text-4xl font-medium text-white">
              Welcome to Orbit
            </h1>
            <p className="mt-3 text-sm font-light leading-relaxed text-white/48">
              A secure command centre for the Marlo Hotels digital estate.
            </p>
          </div>

          <Suspense fallback={null}>
            <OrbitLoginForm />
          </Suspense>
        </div>

        <p className="mt-7 text-center text-[11px] tracking-[0.15em] text-white/38">
          Developed by{" "}
          <Link
            href="https://theglobalorbit.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#d0a654] transition hover:text-[#ebcd8c]"
          >
            The Global Orbit
          </Link>
        </p>
      </div>
    </section>
  );
}
