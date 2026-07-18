import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PostCard } from "@/components/cards/post-card";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Post } from "@/types/content";

export function JournalPreview({ posts }: { posts: Post[] }) {
  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="The Journal"
          title="Latest from the valley"
          description="Itineraries from our concierge desk, the craft behind the suites, and dispatches from Amaya's kitchen."
        />

        <Stagger className="mt-16 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <StaggerItem key={post.slug}>
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline-dark" size="lg">
            <Link href="/blog">
              Read The Journal
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
