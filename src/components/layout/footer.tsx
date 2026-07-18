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
import { footerNav, siteConfig } from "@/lib/site";

const socials = [
  { label: "Instagram", href: siteConfig.social.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FacebookIcon },
  { label: "X (Twitter)", href: siteConfig.social.twitter, Icon: XIcon },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: YoutubeIcon },
];

export function Footer() {
  return (
    <footer className="bg-forest-950 text-cream-200">
      {/* Newsletter band */}
      <div className="border-b border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 py-16 md:flex-row md:justify-between md:px-8">
          <div className="max-w-md text-center md:text-left">
            <p className="eyebrow">The Marlo Letter</p>
            <h2 className="font-display mt-3 text-3xl font-medium text-ivory">
              Stories & private offers, occasionally
            </h2>
            <p className="mt-3 text-sm font-light text-cream-200/70">
              A considered letter from the valley — new seasons, quiet
              openings and offers reserved for subscribers.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed font-light text-cream-200/70">
            A five-star sanctuary in the heart of Kathmandu — timeless
            elegance, celebrated dining and Himalayan hospitality.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
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
            ))}
          </div>
        </div>

        <nav aria-label="Hotel">
          <p className="eyebrow">The Hotel</p>
          <ul className="mt-5 space-y-3">
            {footerNav.hotel.map((link) => (
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
          <p className="eyebrow">Discover</p>
          <ul className="mt-5 space-y-3">
            {footerNav.discover.map((link) => (
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
          <p className="eyebrow">Find Us</p>
          <ul className="mt-5 space-y-4 text-sm font-light text-cream-200/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <span>{siteConfig.contact.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="hover:text-gold-300"
              >
                {siteConfig.contact.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="hover:text-gold-300"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-gold-500" />
              <span>
                Check-in {siteConfig.hours.checkIn} · Check-out{" "}
                {siteConfig.hours.checkOut}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs font-light tracking-wider text-cream-200/50 md:flex-row md:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.legalName} All rights
            reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="text-gold-500">✦</span> {siteConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
