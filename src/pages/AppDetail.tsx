import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppData, ReleaseData } from "../types";
import { dbService } from "../lib/supabase";
import { MarkdownLite } from "../lib/markdown";
import { timeAgo } from "../lib/format";
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  Info,
  Hash,
  AlertTriangle,
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
      <div className="max-w-6xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-text-secondary">reading manifest…</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="border border-bg-raised bg-bg-surface rounded-md p-8">
          <AlertTriangle className="text-accent-rose mx-auto mb-4" size={32} />
          <h2 className="text-lg font-bold font-mono text-text-primary">App not found</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto font-body">
            No package matches that identifier in the Dayynime Store directory.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 border border-accent-indigo text-accent-indigo text-xs font-mono font-semibold px-4 py-2.5 rounded-sm hover:bg-accent-indigo/10 transition-all"
          >
            <ArrowLeft size={14} />
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  const latestRelease = releases.find((r) => r.is_latest) || releases[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="app-detail-page">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-accent-indigo transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          back to directory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: package rail */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 border border-bg-raised bg-bg-surface rounded-md p-6 flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"}
              alt={app.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-bg-raised"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150";
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="font-mono text-[11px] text-text-secondary block mb-1">
                /{app.category.toLowerCase().replace(/\s+/g, "-")}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-text-primary leading-tight">
                {app.name}
              </h1>
            </div>
          </div>

          <p className="font-body text-sm text-text-secondary leading-relaxed mb-6 border-b border-bg-raised pb-6">
            {app.description || "No description registered for this package."}
          </p>

          <div className="space-y-3 mb-6 text-xs border-b border-bg-raised pb-6 font-mono">
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">package</span>
              <span className="text-text-primary text-right truncate max-w-[200px]">
                com.dayynime.{app.slug}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">releases</span>
              <span className="text-text-primary text-right">
                {releases.length > 0 ? `${releases.length} build${releases.length > 1 ? "s" : ""}` : "none yet"}
              </span>
            </div>
            {latestRelease && (
              <>
                <div className="flex justify-between gap-3">
                  <span className="text-text-secondary">latest</span>
                  <span className="text-accent-rose text-right">{latestRelease.version}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-text-secondary">size</span>
                  <span className="text-text-primary text-right">
                    {latestRelease.file_size_mb ? `${latestRelease.file_size_mb} MB` : "n/a"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-text-secondary">updated</span>
                  <span className="text-text-primary text-right">{timeAgo(latestRelease.published_at)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-text-secondary">requires</span>
                  <span className="text-text-primary text-right">Android 8.0+</span>
                </div>
              </>
            )}
          </div>

          {latestRelease ? (
            <div className="mt-auto">
              <a
                href={latestRelease.download_url}
                download
                className="w-full bg-accent-indigo text-bg-base font-mono font-semibold text-xs py-3.5 rounded-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.99] transition-all cursor-pointer"
                id="btn-primary-download"
              >
                <Download size={16} />
                Download {latestRelease.version}
              </a>
              <p className="text-[10px] text-text-secondary font-mono text-center mt-2.5">
                direct GitHub Releases asset · no redirects
              </p>
            </div>
          ) : (
            <div className="border border-bg-raised p-4 rounded-sm text-center">
              <p className="text-xs text-text-secondary font-mono">No builds published yet.</p>
            </div>
          )}
        </div>

        {/* RIGHT: release history */}
        <div className="lg:col-span-8">
          <div className="border border-bg-raised bg-bg-surface rounded-md p-6 sm:p-8">
            <h2 className="text-base font-bold font-mono text-text-primary mb-6 flex items-center gap-2">
              <Hash size={15} className="text-accent-indigo" />
              Release history
            </h2>

            {releases.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-bg-raised rounded-md">
                <FileText size={22} className="text-text-secondary/40 mx-auto mb-2" />
                <p className="text-xs text-text-secondary font-mono">No releases recorded yet.</p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l border-bg-raised space-y-9">
                {releases.map((rel, index) => {
                  const isLatest = rel.is_latest || index === 0;
                  return (
                    <div key={rel.id} className="relative" id={`release-item-${rel.version}`}>
                      <span
                        className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-3 h-3 rounded-full border-2 border-bg-surface ${
                          isLatest ? "bg-accent-rose" : "bg-bg-raised"
                        }`}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-bg-raised">
                        <div className="flex items-center gap-2.5 font-mono">
                          <span className="text-sm font-bold text-text-primary">{rel.version}</span>
                          {rel.is_latest && (
                            <span className="text-accent-rose text-[10px] border border-accent-rose/30 px-1.5 py-0.5 rounded-sm">
                              latest
                            </span>
                          )}
                          {rel.file_size_mb && (
                            <span className="text-[11px] text-text-secondary">{rel.file_size_mb} MB</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(rel.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <a
                            href={rel.download_url}
                            download
                            title={`Download APK version ${rel.version}`}
                            className="border border-bg-raised hover:border-accent-indigo hover:text-accent-indigo text-text-primary px-2 py-1.5 rounded-sm transition-all active:scale-95 flex items-center gap-1 text-[10px]"
                          >
                            <Download size={11} />
                            get apk
                          </a>
                        </div>
                      </div>

                      <div className="mt-3 pl-0.5">
                        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-2">
                          Changelog
                        </span>
                        <div className="font-body text-[13px] text-text-secondary leading-relaxed space-y-1.5">
                          {rel.changelog ? (
                            <MarkdownLite text={rel.changelog} className="space-y-1.5" />
                          ) : (
                            <span className="text-[13px] italic text-text-secondary/60">
                              No changelog recorded for this build.
                            </span>
                          )}
                        </div>
                      </div>

                      {isLatest && (
                        <div className="mt-4 border border-bg-raised rounded-sm p-3 text-[11px] font-mono text-text-secondary flex items-start gap-2 max-w-xl">
                          <Info size={13} className="text-accent-indigo shrink-0 mt-0.5" />
                          <p>Downloads are served directly from the GitHub Releases asset — no intermediaries.</p>
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
