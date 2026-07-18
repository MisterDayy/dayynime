import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppData, ReleaseData } from "../types";
import { dbService, isSupabaseConfigured } from "../lib/supabase";
import { timeAgo } from "../lib/format";
import {
  Search,
  Download,
  ArrowRight,
  Info,
  Database,
  Check,
} from "lucide-react";

export const Home: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [releases, setReleases] = useState<Record<string, ReleaseData[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedApps = await dbService.getApps(false); // Only published apps
        setApps(fetchedApps);

        const relMap: Record<string, ReleaseData[]> = {};
        for (const app of fetchedApps) {
          const appRels = await dbService.getReleases(app.id);
          relMap[app.id] = appRels;
        }
        setReleases(relMap);
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = ["All", ...Array.from(new Set(apps.map((app) => app.category)))];

  const filteredApps = apps.filter((app) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFeaturedApp = (): { app: AppData; latestRel?: ReleaseData } | null => {
    if (apps.length === 0) return null;
    const appsWithLatestDate = apps.map((app) => {
      const appRels = releases[app.id] || [];
      const latest = appRels.find((r) => r.is_latest) || appRels[0];
      return { app, latest, time: latest ? new Date(latest.published_at).getTime() : 0 };
    });
    const sorted = appsWithLatestDate.sort((a, b) => b.time - a.time);
    return { app: sorted[0].app, latestRel: sorted[0].latest };
  };

  const featured = getFeaturedApp();
  const gridApps = featured ? filteredApps.filter((app) => app.id !== featured.app.id) : filteredApps;
  const showFeatured = featured && searchQuery.trim() === "" && selectedCategory === "All";
  const totalReleases = Object.values(releases).reduce((n, r) => n + r.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* HERO */}
      <section className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-bg-raised">
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] text-accent-indigo tracking-wider mb-4">
            /// ANDROID PORTAL — DIRECT BUILDS, NO REDIRECTS
          </p>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-[1.15]">
            Dayynime<span className="text-text-secondary">/</span>store
          </h1>
          <p className="font-body text-text-secondary text-base sm:text-lg mt-4 max-w-xl leading-relaxed">
            A small, hand-run catalog of the Android apps we build. Every release is checked
            in, versioned and served straight from the source — nothing sits between you and
            the file.
          </p>

          {!loading && apps.length > 0 && (
            <div className="font-mono text-xs text-text-secondary mt-6 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{apps.length} app{apps.length === 1 ? "" : "s"}</span>
              <span className="text-bg-raised">·</span>
              <span>{totalReleases} release{totalReleases === 1 ? "" : "s"}</span>
              {featured?.latestRel && (
                <>
                  <span className="text-bg-raised">·</span>
                  <span>latest {featured.latestRel.version}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Terminal mockup — the signature element */}
        <div className="lg:col-span-5">
          <div className="border border-bg-raised bg-bg-surface rounded-md overflow-hidden shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-bg-raised bg-bg-raised/40">
              <span className="w-2.5 h-2.5 rounded-full bg-text-secondary/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-text-secondary/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-text-secondary/30" />
              <span className="ml-2 font-mono text-[10px] text-text-secondary">dayynime.sh</span>
            </div>
            <div className="p-4 font-mono text-[12px] leading-relaxed">
              <p className="text-text-secondary">
                <span className="text-accent-indigo">$</span> fetch --app aniku
              </p>
              <p className="text-text-secondary/70">resolving latest release…</p>
              {featured?.latestRel ? (
                <p className="text-text-primary">
                  <Check size={12} className="inline mb-0.5 text-accent-indigo" /> {featured.latestRel.version} ·{" "}
                  {featured.latestRel.file_size_mb ? `${featured.latestRel.file_size_mb} MB` : "verified"} · direct link
                </p>
              ) : (
                <p className="text-text-primary/70">no release indexed yet</p>
              )}
              <p className="text-text-secondary cursor-blink">↓ ready to install</p>
            </div>
          </div>
        </div>
      </section>

      {/* SANDBOX MODE NOTICE */}
      {!isSupabaseConfigured && (
        <div className="border-l-2 border-accent-indigo bg-bg-surface px-5 py-4 my-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex gap-3">
            <Info className="text-accent-indigo shrink-0 mt-0.5" size={16} />
            <div>
              <h4 className="text-sm font-semibold text-text-primary font-mono">
                Running in local sandbox mode
              </h4>
              <p className="text-xs text-text-secondary mt-1 font-body">
                Apps and releases are seeded data persisted to your browser's local storage.
                Connect a real database anytime by setting{" "}
                <code className="text-accent-indigo font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="text-accent-indigo font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-secondary uppercase border border-bg-raised px-2 py-1 rounded shrink-0">
            local storage active
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-text-secondary">reading catalog…</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-bg-raised rounded-md my-8">
          <Database size={28} className="text-text-secondary/40 mb-3" />
          <h3 className="text-sm font-semibold text-text-primary font-mono">No apps published</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm font-body">
            The store is currently empty. Check back soon.
          </p>
        </div>
      ) : (
        <>
          {/* FEATURED RELEASE */}
          {showFeatured && (
            <section className="py-10 border-b border-bg-raised" id="featured-hero">
              <p className="font-mono text-[11px] text-text-secondary tracking-wider mb-4">
                // HIGHLIGHTED RELEASE
              </p>
              <div className="border border-bg-raised bg-bg-surface rounded-md overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-bg-raised">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-[11px]">
                        <span className="text-text-secondary">/{featured.app.category.toLowerCase().replace(/\s+/g, "-")}</span>
                        {featured.latestRel && (
                          <span className="text-accent-rose border border-accent-rose/30 px-1.5 py-0.5 rounded-sm">
                            {featured.latestRel.version} · latest
                          </span>
                        )}
                        <span className="text-text-secondary">
                          updated {timeAgo(featured.latestRel?.published_at)}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold font-mono text-text-primary">
                        {featured.app.name}
                      </h2>
                      <p className="font-body text-text-secondary text-sm sm:text-base mt-3 leading-relaxed max-w-2xl">
                        {featured.app.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-bg-raised">
                      {featured.latestRel ? (
                        <>
                          <a
                            href={featured.latestRel.download_url}
                            download
                            className="bg-accent-indigo text-bg-base text-xs font-mono font-semibold px-5 py-3 rounded-sm flex items-center gap-2 hover:brightness-110 active:scale-[.98] transition-all"
                            id={`btn-download-${featured.app.slug}`}
                          >
                            <Download size={14} />
                            Download APK ({featured.latestRel.file_size_mb ? `${featured.latestRel.file_size_mb} MB` : "direct"})
                          </a>
                          <Link
                            to={`/app/${featured.app.slug}`}
                            className="border border-bg-raised hover:border-text-secondary text-text-primary text-xs font-mono px-5 py-3 rounded-sm flex items-center gap-1.5 transition-all"
                          >
                            Changelog & history
                            <ArrowRight size={13} />
                          </Link>
                        </>
                      ) : (
                        <Link
                          to={`/app/${featured.app.slug}`}
                          className="border border-bg-raised hover:border-accent-indigo text-text-primary text-xs font-mono px-5 py-3 rounded-sm flex items-center gap-1.5 transition-all"
                        >
                          View releases
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-bg-base/40 p-6 flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={featured.app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"}
                        alt={featured.app.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-bg-raised shadow-2xl"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150";
                        }}
                      />
                      <span className="font-mono text-[11px] text-text-primary mt-4 border-t border-bg-raised pt-3">
                        com.dayynime.{featured.app.slug}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* FILTER / SEARCH */}
          <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none font-mono text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "border-accent-indigo text-accent-indigo"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input
                type="text"
                placeholder="search directory…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-surface border border-bg-raised focus:border-accent-indigo text-text-primary placeholder:text-text-secondary/60 pl-9 pr-4 py-2 rounded-sm text-xs font-mono outline-none transition-all"
              />
            </div>
          </div>

          {/* CATALOG GRID */}
          <div className="pb-16">
            <p className="font-mono text-[11px] text-text-secondary tracking-wider mb-4">
              {searchQuery.trim() !== "" || selectedCategory !== "All" ? "// FILTERED RESULTS" : "// ALL APPS"} ({filteredApps.length})
            </p>

            {filteredApps.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-bg-raised rounded-md">
                <p className="text-xs text-text-secondary font-mono">No apps match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridApps.map((app) => {
                  const appRels = releases[app.id] || [];
                  const latest = appRels.find((r) => r.is_latest) || appRels[0];

                  return (
                    <div
                      key={app.id}
                      className="border border-bg-raised bg-bg-surface hover:border-accent-indigo/50 rounded-md p-5 flex flex-col justify-between transition-colors"
                      id={`app-card-${app.slug}`}
                    >
                      <div>
                        <div className="flex items-start gap-3.5 mb-3">
                          <img
                            src={app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                            alt={app.name}
                            className="w-11 h-11 object-cover rounded-lg border border-bg-raised shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100";
                            }}
                          />
                          <div className="min-w-0 flex-1 pt-0.5">
                            <span className="text-[10px] font-mono text-text-secondary block">
                              /{app.category.toLowerCase().replace(/\s+/g, "-")}
                            </span>
                            <h4 className="text-base font-bold font-mono text-text-primary truncate mt-0.5">
                              {app.name}
                            </h4>
                          </div>
                        </div>

                        <p className="font-body text-[13px] text-text-secondary line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {app.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-bg-raised flex items-center justify-between gap-2">
                        <div className="min-w-0 font-mono">
                          {latest ? (
                            <div>
                              <span className="text-[11px] text-text-primary font-semibold block">
                                {latest.version}
                              </span>
                              <span className="text-[10px] text-text-secondary">
                                updated {timeAgo(latest.published_at)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-secondary uppercase">no release yet</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {latest && (
                            <a
                              href={latest.download_url}
                              download
                              title="Download APK"
                              className="border border-bg-raised hover:border-accent-indigo hover:text-accent-indigo text-text-primary p-2 rounded-sm transition-all active:scale-95"
                            >
                              <Download size={13} />
                            </a>
                          )}
                          <Link
                            to={`/app/${app.slug}`}
                            className="text-accent-indigo text-xs font-mono font-semibold px-3 py-2 rounded-sm border border-accent-indigo/30 hover:border-accent-indigo transition-all"
                          >
                            releases
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
