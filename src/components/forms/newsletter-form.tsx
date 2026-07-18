"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { newsletterSchema, type NewsletterInput } from "@/lib/validators";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(data: NewsletterInput) {
    setStatus("sending");
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-3 text-sm font-light text-gold-300">
        <span className="grid size-9 place-items-center rounded-full border border-gold-500/50">
          <Check className="size-4" />
        </span>
        Welcome to the Marlo Letter. Your first edition is on its way.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md"
      noValidate
    >
      <div className="flex border-b border-ivory/30 transition-colors focus-within:border-gold-400">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          autoComplete="email"
          {...register("email")}
          className="w-full bg-transparent py-3.5 text-sm font-light tracking-wide text-ivory outline-none placeholder:text-cream-200/40"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          aria-label="Subscribe"
          className="grid size-12 shrink-0 place-items-center text-gold-400 transition-transform duration-300 hover:translate-x-1 disabled:opacity-50"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>
      {errors.email ? (
        <p role="alert" className="mt-2 text-xs font-light text-red-400">
          {errors.email.message}
        </p>
      ) : null}
    </form>
  );
}
