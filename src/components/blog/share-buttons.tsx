"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import {
  FacebookIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/shared/social-icons";
import { siteConfig } from "@/lib/site";

type ShareButtonsProps = {
  title: string;
  path: string;
};

export function ShareButtons({ title, path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${siteConfig.url}${path}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Share on X",
      href: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: XIcon,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinIcon,
    },
  ];

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-medium tracking-[0.3em] text-charcoal-900/50 uppercase">
        Share
      </span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="grid size-10 place-items-center rounded-full border border-forest-800/20 text-forest-900 transition-all duration-300 hover:border-gold-500 hover:text-gold-600"
        >
          <Icon className="size-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        aria-label={copied ? "Link copied" : "Copy link"}
        className="grid size-10 place-items-center rounded-full border border-forest-800/20 text-forest-900 transition-all duration-300 hover:border-gold-500 hover:text-gold-600"
      >
        {copied ? (
          <Check className="size-4 text-gold-600" />
        ) : (
          <Link2 className="size-4" />
        )}
      </button>
    </div>
  );
}
