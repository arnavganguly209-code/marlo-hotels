"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { contactSchema, type ContactInput } from "@/lib/validators";

const fieldClass =
  "border-forest-800/20 text-forest-950 placeholder:text-forest-900/35";

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: defaultSubject ?? "" },
  });

  async function onSubmit(data: ContactInput) {
    setStatus("sending");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(response.ok ? "done" : "error");
  }

  if (status === "done") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full border border-gold-500/60 text-gold-600">
          <Check className="size-6" />
        </span>
        <h3 className="font-display text-3xl font-medium text-forest-950">
          Thank you for writing
        </h3>
        <p className="max-w-sm text-sm font-light text-charcoal-900/65">
          Your message has reached our team. A member of the concierge desk
          will reply within one working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name" className="text-forest-900">
            Full Name
          </Label>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="Alexandra Laurent"
            className={fieldClass}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="contact-email" className="text-forest-900">
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={fieldClass}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-phone" className="text-forest-900">
            Phone <span className="normal-case opacity-50">(optional)</span>
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            className={fieldClass}
            {...register("phone")}
          />
        </div>
        <div>
          <Label htmlFor="contact-subject" className="text-forest-900">
            Subject
          </Label>
          <Input
            id="contact-subject"
            placeholder="A stay this autumn"
            className={fieldClass}
            {...register("subject")}
          />
          <FieldError message={errors.subject?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message" className="text-forest-900">
          Message
        </Label>
        <Textarea
          id="contact-message"
          placeholder="Tell us how we can make your stay extraordinary…"
          className={fieldClass}
          {...register("message")}
        />
        <FieldError message={errors.message?.message} />
      </div>

      {status === "error" ? (
        <p role="alert" className="text-sm font-light text-red-500">
          Something went wrong sending your message. Please try again, or
          email us directly.
        </p>
      ) : null}

      <Button
        type="submit"
        variant="forest"
        size="lg"
        disabled={status === "sending"}
        className="w-full sm:w-auto"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
        <Send />
      </Button>
    </form>
  );
}
