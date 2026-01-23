export default function MovieApiPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-white">
          Movie API
        </h1>
        <p className="text-xl text-zinc-400">
          Coming soon - Access movie data and recommendations.
        </p>
      </div>

      <section className="space-y-6">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Under Development
          </h2>
          <p className="text-zinc-400">
            We&apos;re currently building this API. Check back soon for updates!
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-white">Planned Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Movie Search
            </h3>
            <p className="text-zinc-400">
              Search for movies by title, genre, or release year.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Recommendations
            </h3>
            <p className="text-zinc-400">
              Get personalized movie recommendations based on preferences.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Ratings & Reviews
            </h3>
            <p className="text-zinc-400">
              Access aggregated ratings from multiple sources.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Streaming Availability
            </h3>
            <p className="text-zinc-400">
              Find where to watch movies across streaming platforms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
