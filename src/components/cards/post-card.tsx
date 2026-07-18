import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/content";
import { formatDate } from "@/lib/utils";

export function PostCard({
  post,
  actionLabel = "Read Article",
}: {
  post: Post;
  actionLabel?: string;
}) {
  return (
    <article className="group relative flex h-full flex-col">
      <div className="img-hover-frame shadow-luxury-sm relative aspect-[16/10] overflow-hidden rounded-xl">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          quality={100}
          unoptimized={post.image.src.startsWith("/media/")}
          className="object-cover"
        />
        <span className="glass-dark absolute top-4 left-4 rounded-full px-4 py-1.5 text-[9px] font-medium tracking-[0.28em] text-gold-300 uppercase">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-center gap-3 text-[11px] font-light tracking-[0.14em] text-charcoal-900/50 uppercase">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true" className="text-gold-500">
            ·
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3" />
            {post.readingTime}
          </span>
        </div>
        <h3 className="font-display mt-3 text-2xl leading-snug font-medium text-forest-950 transition-colors duration-300 group-hover:text-forest-700">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed font-light text-charcoal-900/60">
          {post.excerpt}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-gold-600 uppercase">
          {actionLabel}
          <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
        </span>
      </div>
    </article>
  );
}
