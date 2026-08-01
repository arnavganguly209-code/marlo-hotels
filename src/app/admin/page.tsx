import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = {
  title: "Admin Login | Marlo Hotels",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-forest-950 px-5 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#06100c]/75 via-[#0a1712]/82 to-[#06100c]/92" />

      <div className="relative z-10 w-full max-w-md animate-[fadeUp_0.7s_ease-out]">
        <AdminLoginForm />
      </div>

      <p className="relative z-10 mt-10 text-center text-[11px] tracking-[0.1em] text-cream-200/50">
        Software Developed by{" "}
        <Link
          href="https://theglobalorbit.com/"
          target="_blank"
          className="text-[#D9B46B] hover:underline"
        >
          Global Orbit
        </Link>
      </p>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
