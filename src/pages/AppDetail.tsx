import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppData, ReleaseData } from "../types";
import { dbService } from "../lib/supabase";
import { WaveformBar } from "../components/WaveformBar";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  FileText, 
  Info, 
  CheckCircle,
  Hash,
  AlertTriangle
} from "lucide-react";

export const AppDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [app, setApp] = useState<AppData | null>(null);
  const [releases, setReleases] = useState<ReleaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDetailData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const fetchedApp = await dbService.getAppBySlug(slug);
        if (fetchedApp) {
          setApp(fetchedApp);
          const fetchedReleases = await dbService.getReleases(fetchedApp.id);
          setReleases(fetchedReleases);
        }
      } catch (err) {
        console.error("Failed to load app detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetailData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-text-secondary">Retrieving package manifest...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-bg-surface border border-bg-surface/50 rounded-lg p-8">
          <AlertTriangle className="text-accent-rose mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold font-display text-text-primary">Repository Not Found</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
            The requested package identifier does not match any registered application in Dayynime Store.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 bg-accent-indigo text-text-primary text-xs font-semibold px-4 py-2.5 rounded hover:bg-opacity-90 transition-all"
          >
            <ArrowLeft size={14} />
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  // Find latest release
  const latestRelease = releases.find((r) => r.is_latest) || releases[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="app-detail-page">
      {/* Breadcrumb Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-accent-indigo transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          BACK TO PORTAL DIRECTORY
        </Link>
      </div>

      {/* Main Responsive Grid: Two-Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Fixed Rail (Desktop) / Header Area (Mobile) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 bg-bg-surface border border-bg-surface/40 rounded-lg p-6 flex flex-col">
          {/* App Branding Header */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"}
              alt={app.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-bg-base/80"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150";
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="bg-accent-indigo/10 text-accent-indigo font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-accent-indigo/10 inline-block mb-1">
                {app.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary leading-tight">
                {app.name}
              </h1>
            </div>
          </div>

          {/* Activity Bar Element */}
          <div className="flex items-center justify-between bg-bg-base/30 border border-bg-base/50 p-3 rounded-md mb-6">
            <span className="text-[11px] font-mono text-text-secondary">Release Frequency Sparkline</span>
            <WaveformBar seed={app.slug} active={true} />
          </div>

          {/* Description */}
          <div className="text-sm text-text-secondary leading-relaxed mb-6 border-b border-bg-base/60 pb-6">
            <h3 className="text-xs font-mono text-text-primary uppercase tracking-wider mb-2">About Application</h3>
            <p className="font-body text-xs leading-relaxed text-text-secondary/90">
              {app.description || "No full description registered for this package."}
            </p>
          </div>

          {/* Package Data Fields */}
          <div className="space-y-3.5 mb-6 text-xs border-b border-bg-base/60 pb-6 font-mono">
            <div className="flex justify-between">
              <span className="text-text-secondary uppercase text-[10px]">Package ID</span>
              <span className="text-text-primary font-medium text-right truncate max-w-[200px]">
                com.dayynime.{app.slug}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary uppercase text-[10px]">Release Cadence</span>
              <span className="text-text-primary font-medium text-right">
                {releases.length > 0 ? `${releases.length} Build${releases.length > 1 ? "s" : ""}` : "No Active Builds"}
              </span>
            </div>
            {latestRelease && (
              <>
                <div className="flex justify-between">
                  <span className="text-text-secondary uppercase text-[10px]">Latest Build</span>
                  <span className="text-text-primary font-medium text-right text-accent-rose">
                    {latestRelease.version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary uppercase text-[10px]">Installer Size</span>
                  <span className="text-text-primary font-medium text-right">
                    {latestRelease.file_size_mb ? `${latestRelease.file_size_mb} MB` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary uppercase text-[10px]">Build Target</span>
                  <span className="text-text-primary font-medium text-right">Android 8.0+ (API 26)</span>
                </div>
              </>
            )}
          </div>

          {/* Primary Action: High-visibility Download Button for latest release */}
          {latestRelease ? (
            <div className="mt-auto">
              <a
                href={latestRelease.download_url}
                download
                className="w-full bg-accent-indigo text-text-primary font-semibold text-xs py-3.5 rounded-md flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-99 transition-all cursor-pointer shadow-lg shadow-accent-indigo/10"
                id="btn-primary-download"
              >
                <Download size={16} />
                Download Latest APK ({latestRelease.version})
              </a>
              <p className="text-[10px] text-text-secondary/70 font-mono text-center mt-2.5 flex items-center justify-center gap-1">
                <CheckCircle size={10} className="text-accent-indigo" />
                Direct Link • Safe Github Release Asset
              </p>
            </div>
          ) : (
            <div className="bg-bg-base/30 border border-bg-base/60 p-4 rounded text-center">
              <p className="text-xs text-text-secondary font-mono">No active installers registered.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Commit-Log Style Release Timeline */}
        <div className="lg:col-span-8">
          <div className="bg-bg-surface/50 border border-bg-surface/30 rounded-lg p-6 sm:p-8">
            <h2 className="text-lg font-bold font-display text-text-primary mb-6 flex items-center gap-2">
              <Hash size={16} className="text-accent-indigo" />
              Build Release History & Changelogs
            </h2>

            {releases.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-bg-surface rounded-lg">
                <FileText size={24} className="text-text-secondary/40 mx-auto mb-2" />
                <p className="text-xs text-text-secondary font-mono">No releases recorded yet for this app.</p>
                <p className="text-[11px] text-text-secondary/60 mt-1">
                  Releases will appear here once registered in the Admin panel.
                </p>
              </div>
            ) : (
              /* VERTICAL TIMELINE RULE */
              <div className="relative pl-6 sm:pl-8 border-l border-bg-surface/80 space-y-10">
                {releases.map((rel, index) => {
                  const isLatest = rel.is_latest || index === 0; // fallback highlight if not set
                  
                  return (
                    <div 
                      key={rel.id} 
                      className="relative group transition-all duration-300"
                      id={`release-item-${rel.version}`}
                    >
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-colors duration-300 ${
                        isLatest 
                          ? "bg-accent-rose border-bg-base" 
                          : "bg-bg-surface border-bg-surface group-hover:border-accent-indigo"
                      }`} />

                      {/* Version Line Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-bg-surface/60">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-text-primary">
                            {rel.version}
                          </span>
                          
                          {rel.is_latest && (
                            <span className="bg-accent-rose/10 text-accent-rose text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-accent-rose/10 uppercase tracking-wider">
                              Latest Stable
                            </span>
                          )}

                          {rel.file_size_mb && (
                            <span className="text-[10px] font-mono text-text-secondary">
                              ({rel.file_size_mb} MB)
                            </span>
                          )}
                        </div>

                        {/* Date and Direct Download Icon */}
                        <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Calendar size={11} />
                            {new Date(rel.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </span>

                          <a
                            href={rel.download_url}
                            download
                            title={`Download APK version ${rel.version}`}
                            className="bg-bg-base border border-bg-surface hover:border-accent-indigo text-text-primary p-1.5 rounded transition-all active:scale-95 flex items-center gap-1 font-mono text-[10px]"
                          >
                            <Download size={11} className="text-accent-indigo" />
                            GET APK
                          </a>
                        </div>
                      </div>

                      {/* Changelog Section */}
                      <div className="mt-3.5 pl-1">
                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-2">
                          Changelog & Improvements
                        </span>
                        
                        <div className="text-xs text-text-secondary font-body leading-relaxed space-y-1.5 whitespace-pre-wrap">
                          {rel.changelog ? (
                            rel.changelog.split("\n").map((line, lIdx) => {
                              // If it starts with dash or bullet, style it nicely
                              const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
                              return (
                                <p 
                                  key={lIdx} 
                                  className={isBullet ? "pl-2.5 relative before:content-['•'] before:absolute before:left-0 before:text-accent-indigo" : ""}
                                >
                                  {isBullet ? line.replace(/^[-*]\s*/, "") : line}
                                </p>
                              );
                            })
                          ) : (
                            <span className="text-[11px] italic text-text-secondary/50">No changelog registered for this build.</span>
                          )}
                        </div>
                      </div>

                      {/* Direct Asset Helper Notice for Latest Build */}
                      {isLatest && (
                        <div className="mt-4 bg-bg-surface/30 border border-bg-surface/50 rounded p-3 text-[10px] font-mono text-text-secondary leading-normal flex items-start gap-2 max-w-xl">
                          <Info size={13} className="text-accent-indigo shrink-0 mt-0.5" />
                          <p>
                            Downloads are verified safe build assets hosted on GitHub. They bypass intermediaries and download directly in your browser.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
