import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppData, ReleaseData } from "../types";
import { dbService, isSupabaseConfigured } from "../lib/supabase";
import { WaveformBar } from "../components/WaveformBar";
import { 
  Search, 
  Download, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  Settings, 
  Database,
  Info
} from "lucide-react";

export const Home: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [releases, setReleases] = useState<Record<string, ReleaseData[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const fetchedApps = await dbService.getApps(false); // Only published apps
        setApps(fetchedApps);

        // Fetch releases for each app
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

  // Gather unique categories for filter tabs
  const categories = ["All", ...Array.from(new Set(apps.map((app) => app.category)))];

  // Filter apps based on search & category
  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pick the featured app: the one with the most recent release, or simply the first one
  const getFeaturedApp = (): { app: AppData; latestRel?: ReleaseData } | null => {
    if (apps.length === 0) return null;
    
    // Sort apps by their latest release published date
    const appsWithLatestDate = apps.map(app => {
      const appRels = releases[app.id] || [];
      const latest = appRels.find(r => r.is_latest) || appRels[0];
      return {
        app,
        latest,
        time: latest ? new Date(latest.published_at).getTime() : 0
      };
    });

    const sortedByRelease = appsWithLatestDate.sort((a, b) => b.time - a.time);
    return {
      app: sortedByRelease[0].app,
      latestRel: sortedByRelease[0].latest
    };
  };

  const featured = getFeaturedApp();
  // Filter out the featured app from the secondary grid so the layout is truly asymmetric
  const gridApps = featured 
    ? filteredApps.filter(app => app.id !== featured.app.id) 
    : filteredApps;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Header & Brand Description */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-bg-surface pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-accent-rose text-bg-base font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm">
              Android Portal
            </span>
            <span className="text-accent-indigo text-xs font-mono font-medium">• Fast Direct Downloads</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-text-primary">
            Dayynime <span className="text-accent-indigo">Store</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1 max-w-xl">
            A minimalist, hyper-focused catalog of high-performance Android streaming utilities. Zero redirects, ad-free downloads straight from secure release builds.
          </p>
        </div>

        {/* Quick Admin Navigation Link */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-2 border border-bg-surface hover:border-accent-indigo bg-bg-surface text-text-primary px-4 py-2 rounded-md text-xs font-medium transition-all duration-200"
            id="btn-admin-panel"
          >
            <Settings size={14} className="text-accent-indigo" />
            Admin Console
          </Link>
        </div>
      </div>

      {/* 2. Sandbox Mode Info Card */}
      {!isSupabaseConfigured && (
        <div className="bg-bg-surface border-l-2 border-accent-indigo px-5 py-4 mb-8 rounded-r-md flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex gap-3">
            <Info className="text-accent-indigo shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-semibold text-text-primary font-display flex items-center gap-2">
                Running in Local Sandbox Mode
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                This applet is fully interactive! Apps and releases are loaded from pre-seeded data and persist in your browser's local storage. Hook up your real database anytime by setting <code className="text-accent-indigo font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-accent-indigo font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment secrets.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center">
            <span className="text-[10px] font-mono text-text-secondary uppercase border border-bg-base/80 bg-bg-base/40 px-2 py-1 rounded">
              Local Storage DB Active
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-text-secondary">Parsing digital inventory...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-bg-surface rounded-lg">
          <Database size={32} className="text-text-secondary/40 mb-3" />
          <h3 className="text-base font-semibold text-text-primary font-display">No Apps Published</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            The store is currently empty. Head over to the Admin Console to register the first Android streaming app.
          </p>
          <Link
            to="/admin"
            className="mt-4 bg-accent-indigo text-text-primary text-xs font-medium px-4 py-2 rounded hover:bg-opacity-90 transition-all duration-200"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      ) : (
        <>
          {/* 3. Asymmetric Featured App Banner */}
          {featured && searchQuery.trim() === "" && selectedCategory === "All" && (
            <div className="mb-12" id="featured-hero">
              <span className="text-xs font-mono text-accent-rose uppercase tracking-widest font-bold block mb-3">
                ★ Highlighted Release
              </span>
              <div className="bg-bg-surface border border-bg-surface rounded-lg overflow-hidden group hover:border-accent-indigo/40 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left content column */}
                  <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="bg-accent-indigo/10 text-accent-indigo font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm border border-accent-indigo/20">
                          {featured.app.category}
                        </span>
                        {featured.latestRel && (
                          <span className="bg-accent-rose/10 text-accent-rose font-mono text-[10px] px-2 py-1 rounded-sm border border-accent-rose/20 flex items-center gap-1">
                            <Sparkles size={10} />
                            {featured.latestRel.version} LATEST
                          </span>
                        )}
                        <WaveformBar seed={featured.app.slug} active={true} />
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary group-hover:text-accent-indigo transition-colors duration-200">
                        {featured.app.name}
                      </h2>
                      <p className="text-text-secondary text-sm mt-3 leading-relaxed max-w-2xl">
                        {featured.app.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-bg-base/60">
                      {featured.latestRel ? (
                        <>
                          <a
                            href={featured.latestRel.download_url}
                            download
                            className="bg-accent-indigo text-text-primary text-xs font-semibold px-5 py-3 rounded-md flex items-center gap-2 hover:bg-opacity-90 active:scale-98 transition-all"
                            id={`btn-download-${featured.app.slug}`}
                          >
                            <Download size={15} />
                            Download APK ({featured.latestRel.file_size_mb ? `${featured.latestRel.file_size_mb} MB` : "Direct"})
                          </a>
                          <Link
                            to={`/app/${featured.app.slug}`}
                            className="border border-bg-surface hover:border-text-secondary bg-bg-base text-text-primary text-xs font-medium px-5 py-3 rounded-md flex items-center gap-1.5 transition-all"
                          >
                            Changelog & History
                            <ArrowRight size={13} />
                          </Link>
                        </>
                      ) : (
                        <Link
                          to={`/app/${featured.app.slug}`}
                          className="bg-bg-base border border-bg-surface hover:border-accent-indigo text-text-primary text-xs font-medium px-5 py-3 rounded-md flex items-center gap-1.5 transition-all"
                        >
                          View Releases
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right visual column - large image representation with grid fallback */}
                  <div className="lg:col-span-4 bg-bg-base/40 p-6 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-bg-surface/50">
                    <div className="relative group/icon flex flex-col items-center text-center">
                      <img
                        src={featured.app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"}
                        alt={featured.app.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-bg-surface shadow-2xl group-hover/icon:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150";
                        }}
                      />
                      <div className="mt-4">
                        <span className="text-[10px] font-mono text-text-secondary block uppercase">
                          Package Signature
                        </span>
                        <span className="text-xs font-mono text-text-primary font-semibold">
                          com.dayynime.{featured.app.slug}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Filter / Search Section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-bg-surface/30 pt-8">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? "bg-accent-indigo text-text-primary"
                      : "bg-bg-surface text-text-secondary hover:text-text-primary border border-bg-surface/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input
                type="text"
                placeholder="Search apk directory..."
                value={searchQuery === " " ? "" : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-surface border border-bg-surface focus:border-accent-indigo text-text-primary placeholder:text-text-secondary/60 pl-9 pr-4 py-1.5 rounded-md text-xs outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* 5. General Catalog Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-text-secondary uppercase tracking-wider">
              {searchQuery.trim() !== "" || selectedCategory !== "All" ? "Filtered Results" : "All Repositories"} ({filteredApps.length})
            </h3>

            {filteredApps.length === 0 ? (
              <div className="text-center py-16 bg-bg-surface/30 border border-bg-surface rounded-lg">
                <p className="text-xs text-text-secondary">No apps match your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredApps.map((app) => {
                  const appRels = releases[app.id] || [];
                  const latest = appRels.find(r => r.is_latest) || appRels[0];

                  return (
                    <div
                      key={app.id}
                      className="bg-bg-surface border border-bg-surface hover:border-accent-indigo/50 rounded-lg p-5 flex flex-col justify-between group transition-all duration-300"
                      id={`app-card-${app.slug}`}
                    >
                      <div>
                        {/* Upper row: icon, name and category */}
                        <div className="flex items-start gap-4 mb-3">
                          <img
                            src={app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                            alt={app.name}
                            className="w-12 h-12 object-cover rounded-lg border border-bg-base shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-accent-indigo uppercase tracking-wider block">
                              {app.category}
                            </span>
                            <h4 className="text-base font-bold font-display text-text-primary group-hover:text-accent-indigo transition-colors duration-200 truncate mt-0.5">
                              {app.name}
                            </h4>
                          </div>
                        </div>

                        {/* Sparkline & Short description */}
                        <div className="flex items-center justify-between gap-2 my-2.5 pb-2 border-b border-bg-base/60">
                          <span className="text-[10px] font-mono text-text-secondary">Activity Signature</span>
                          <WaveformBar seed={app.slug} active={app.slug === featured?.app.slug} />
                        </div>

                        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {app.description}
                        </p>
                      </div>

                      {/* Footer release detail & CTA */}
                      <div className="mt-5 pt-4 border-t border-bg-base/60 flex items-center justify-between">
                        <div className="min-w-0">
                          {latest ? (
                            <div>
                              <span className="text-[10px] font-mono text-text-primary font-semibold block">
                                {latest.version}
                              </span>
                              <span className="text-[9px] font-mono text-text-secondary uppercase">
                                {latest.file_size_mb ? `${latest.file_size_mb} MB` : "LATEST BUILD"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-text-secondary uppercase">
                              No Release Yet
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {latest && (
                            <a
                              href={latest.download_url}
                              download
                              title="Instant APK download"
                              className="bg-bg-base hover:bg-accent-indigo border border-bg-surface hover:border-accent-indigo text-text-primary p-2 rounded transition-all active:scale-95 shrink-0"
                            >
                              <Download size={13} />
                            </a>
                          )}
                          <Link
                            to={`/app/${app.slug}`}
                            className="bg-accent-indigo/10 hover:bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/10 hover:border-accent-indigo/20 text-xs font-semibold px-3 py-1.5 rounded transition-all"
                          >
                            Releases
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
