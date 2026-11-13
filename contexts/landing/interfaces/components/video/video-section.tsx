import type { LandingVideo } from "@/contexts/landing/interfaces/i18n";

export function VideoSection({ video }: { video: LandingVideo }) {
  return (
    <section
      id="video"
      className="scroll-mt-20 border-t border-border/40 bg-muted/20 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {video.eyebrow}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            {video.title}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {video.description}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-black shadow-2xl">
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src="https://www.youtube-nocookie.com/embed/kHgPlD7BW5s"
              title="Takodu - Video de producto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
