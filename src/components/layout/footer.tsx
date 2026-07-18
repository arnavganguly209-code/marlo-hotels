import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/shared/social-icons";
import type {
  FooterCtaEditorContent,
  FooterEditorContent,
} from "@/lib/homepage-content";
import { footerNav, siteConfig } from "@/lib/site";

const socialIcons = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  "X (Twitter)": XIcon,
  YouTube: YoutubeIcon,
};

export function Footer({
  logoUrl,
  content,
  ctaContent,
}: {
  logoUrl?: string;
  content?: FooterEditorContent;
  ctaContent?: FooterCtaEditorContent;
}) {
  if (content && !content.enabled) return null;

  const newsletterEyebrow = ctaContent?.eyebrow ?? "The Marlo Letter";
  const newsletterHeading =
    ctaContent?.heading ?? "Stories & private offers, occasionally";
  const newsletterDescription =
    ctaContent?.description ??
    "A considered letter from the valley — new seasons, quiet openings and offers reserved for subscribers.";
  const description =
    content?.description ??
    "A five-star sanctuary in the heart of Kathmandu — timeless elegance, celebrated dining and Himalayan hospitality.";
  const hotelHeading = content?.hotelHeading ?? "The Hotel";
  const discoverHeading = content?.discoverHeading ?? "Discover";
  const findUsHeading = content?.findUsHeading ?? "Find Us";
  const address = content?.address ?? siteConfig.contact.address;
  const phone = content?.phone ?? siteConfig.contact.phone;
  const email = content?.email ?? siteConfig.contact.email;
  const checkIn = content?.checkIn ?? siteConfig.hours.checkIn;
  const checkOut = content?.checkOut ?? siteConfig.hours.checkOut;
  const resolvedLogoUrl = content?.logo.src || logoUrl;
  const hotelLinks = content?.hotelLinks ?? footerNav.hotel;
  const discoverLinks = content?.discoverLinks ?? footerNav.discover;
  const socialLinks = content?.socialLinks ?? [
    { label: "Instagram", href: siteConfig.social.instagram },
    { label: "Facebook", href: siteConfig.social.facebook },
    { label: "X (Twitter)", href: siteConfig.social.twitter },
    { label: "YouTube", href: siteConfig.social.youtube },
  ];

  return (
    <footer className="bg-forest-950 text-cream-200">
      {/* Newsletter band */}
      {ctaContent?.enabled !== false ? <div className="border-b border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 py-16 md:flex-row md:justify-between md:px-8">
          <div className="max-w-md text-center md:text-left">
            <p className="eyebrow">{newsletterEyebrow}</p>
            <h2 className="font-display mt-3 text-3xl font-medium text-ivory">
              {newsletterHeading}
            </h2>
            <p className="mt-3 text-sm font-light text-cream-200/70">
              {newsletterDescription}
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div> : null}

      {/* Main columns */}
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <Logo tone="light" src={resolvedLogoUrl} />
          <p className="mt-6 max-w-xs text-sm leading-relaxed font-light text-cream-200/70">
            {description}
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map(({ label, href }) => {
              const Icon =
                socialIcons[label as keyof typeof socialIcons] ?? InstagramIcon;
              return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full border border-ivory/15 text-cream-200/80 transition-all duration-300 hover:border-gold-400 hover:text-gold-400"
              >
                <Icon className="size-4" />
              </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Hotel">
          <p className="eyebrow">{hotelHeading}</p>
          <ul className="mt-5 space-y-3">
            {hotelLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="link-underline text-sm font-light text-cream-200/75 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Discover">
          <p className="eyebrow">{discoverHeading}</p>
          <ul className="mt-5 space-y-3">
            {discoverLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="link-underline text-sm font-light text-cream-200/75 transition-colors hover:text-gold-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">{findUsHeading}</p>
          <ul className="mt-5 space-y-4 text-sm font-light text-cream-200/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <span>{address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="hover:text-gold-300"
              >
                {phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <a href={`mailto:${email}`} className="hover:text-gold-300">
                {email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <span>
                Check-in {checkIn} · Check-out {checkOut}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs font-light tracking-wider text-cream-200/50 md:flex-row md:px-8">
          <p>
            © {new Date().getFullYear()}{" "}
            {content?.copyrightText ??
              `${siteConfig.legalName} All rights reserved.`}
          </p>
          <p>
            {content?.developerLabel ?? "Developed By"}{" "}
            <a
              href={content?.developerUrl ?? "https://theglobalorbit.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold-500 transition-colors hover:text-gold-300"
            >
              {content?.developerName ?? "The Global Orbit"}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
