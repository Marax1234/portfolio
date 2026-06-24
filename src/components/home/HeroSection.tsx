import Media from "@/components/Media";
import VideoLoop from "@/components/VideoLoop";
import HeroCarousel from "@/components/home/HeroCarousel";
import type { AnyMediaRef, ResolvedVideo } from "@/lib/media";

interface HeroSectionProps {
  eyebrow?: string;
  name?: string;
  tagline?: string;
  scrollHint?: string;
  posters?: AnyMediaRef[];
  video?: ResolvedVideo;
}

export default function HeroSection({
  eyebrow = "Fotograf & Videograf",
  name = "Kilian Siebert",
  tagline = "Ich filme das, was sich zu erleben lohnt — auf dem Rad genauso wie auf einer Hochzeit.",
  scrollHint = "↓ Scrollen",
  posters = [],
  video,
}: HeroSectionProps) {
  return (
    <section
      className="relative w-full overflow-hidden min-h-screen flex items-end"
      style={{ marginTop: "calc(-1 * var(--header-height))" }}
    >
      <div
        data-video-slot="hero"
        className="absolute inset-0 w-full h-full"
      >
        {video ? (
          <VideoLoop
            video={video}
            posterSrc={video.posterUrl}
            posterAlt={video.alt}
            variant="hero"
          />
        ) : posters.length > 1 ? (
          <HeroCarousel posters={posters} />
        ) : (
          <Media
            {...(posters[0] ?? { id: "hero-poster" })}
            priority
            sizes="100vw"
            className="absolute inset-0 w-full h-full"
            imageClassName="object-cover w-full h-full"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 container-page pb-16 md:pb-24">
        <p className="type-label-caps text-inverse-on-surface/80 mb-4">{eyebrow}</p>
        <h1 className="type-display-lg text-inverse-on-surface">{name}</h1>
        <p className="type-body-lg text-inverse-on-surface/90 mt-4 max-w-md">{tagline}</p>
        <p className="type-label-caps text-inverse-on-surface/70 mt-12">{scrollHint}</p>
      </div>
    </section>
  );
}
