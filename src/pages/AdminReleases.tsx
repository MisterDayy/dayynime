import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppData, ReleaseData } from "../types";
import { dbService } from "../lib/supabase";
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Save, 
  HelpCircle, 
  AlertCircle, 
  Layers, 
  Info,
  Calendar,
  X,
  FileText
} from "lucide-react";

export const AdminReleases: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // App ID
  const [app, setApp] = useState<AppData | null>(null);
  const [releases, setReleases] = useState<ReleaseData[]>([]);
  
  const [fetching, setFetching] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null);
  const [version, setVersion] = useState<string>("");
  const [changelog, setChangelog] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [fileSizeMb, setFileSizeMb] = useState<string>("");
  const [isLatest, setIsLatest] = useState<boolean>(false);

  useEffect(() => {
    loadAppAndReleases();
  }, [id]);

  const loadAppAndReleases = async () => {
    if (!id) return;
    setFetching(true);
    try {
      const fetchedApp = await dbService.getAppById(id);
      if (fetchedApp) {
        setApp(fetchedApp);
        const fetchedReleases = await dbService.getReleases(fetchedApp.id);
        setReleases(fetchedReleases);
      } else {
        setError("App registration not found in catalog.");
      }
    } catch (err) {
      console.error("Failed to load releases detail:", err);
      setError("Failed to load app or releases directory.");
    } finally {
      setFetching(false);
    }
  };

  const handleEditClick = (rel: ReleaseData) => {
    setEditingReleaseId(rel.id);
    setVersion(rel.version);
    setChangelog(rel.changelog || "");
    setDownloadUrl(rel.download_url);
    setFileSizeMb(rel.file_size_mb ? rel.file_size_mb.toString() : "");
    setIsLatest(rel.is_latest);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingReleaseId(null);
    setVersion("");
    setChangelog("");
    setDownloadUrl("");
    setFileSizeMb("");
    setIsLatest(false);
    setError(null);
  };

  const handleDeleteRelease = async (releaseId: string, versionStr: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete release build "${versionStr}"?`)) {
      return;
    }

    try {
      const res = await dbService.deleteRelease(releaseId);
      if (res.success) {
        setReleases(prev => prev.filter(r => r.id !== releaseId));
        if (editingReleaseId === releaseId) {
          handleCancelEdit();
        }
      } else {
        setError("Failed to delete release: " + res.error);
      }
    } catch (err) {
      console.error("Delete release failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!version.trim()) {
      setError("Version number is required (e.g. v2.4.0).");
      return;
    }
    if (!downloadUrl.trim()) {
      setError("Direct download URL is required.");
      return;
    }
    if (!downloadUrl.toLowerCase().startsWith("http://") && !downloadUrl.toLowerCase().startsWith("https://")) {
      setError("Download link must be a valid http or https URL.");
      return;
    }

    setSubmitting(true);
    const sizeNum = parseFloat(fileSizeMb);

    const releasePayload = {
      app_id: id!,
      version: version.trim(),
      changelog: changelog.trim(),
      download_url: downloadUrl.trim(),
      file_size_mb: isNaN(sizeNum) ? 0 : sizeNum,
      is_latest: isLatest
    };

    try {
      if (editingReleaseId) {
        const res = await dbService.updateRelease(editingReleaseId, releasePayload);
        if (res.success) {
          // Re-fetch all to apply sorting and is_latest auto-unsetting
          const refreshed = await dbService.getReleases(id!);
          setReleases(refreshed);
          handleCancelEdit();
        } else {
          setError(res.error || "Failed to update release build.");
        }
      } else {
        const res = await dbService.createRelease(releasePayload);
        if (res.success) {
          const refreshed = await dbService.getReleases(id!);
          setReleases(refreshed);
          // Reset form fields
          setVersion("");
          setChangelog("");
          setDownloadUrl("");
          setFileSizeMb("");
          setIsLatest(false);
        } else {
          setError(res.error || "Failed to submit new build.");
        }
      }
    } catch (err: any) {
      console.error("Submit release failed:", err);
      setError(err?.message || "An unexpected error occurred saving this build.");
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-text-secondary">Retrieving application releases...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-bg-surface border border-bg-surface/50 rounded-lg p-8">
          <AlertCircle className="text-accent-rose mx-auto mb-4" size={40} />
          <h2 className="text-xl font-bold font-display text-text-primary">App Not Found</h2>
          <p className="text-sm text-text-secondary mt-2">
            The target application registry is missing from the database.
          </p>
          <Link
            to="/admin"
            className="mt-6 inline-flex items-center gap-2 bg-accent-indigo text-text-primary text-xs font-semibold px-4 py-2.5 rounded hover:bg-opacity-90 transition-all"
          >
            <ArrowLeft size={14} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-releases-page">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-accent-indigo transition-all"
        >
          <ArrowLeft size={14} />
          BACK TO ADMIN GENERAL DASHBOARD
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-bg-surface pb-6 mb-8">
        <img
          src={app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
          alt={app.name}
          className="w-14 h-14 object-cover rounded-md border border-bg-surface"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100";
          }}
        />
        <div>
          <span className="text-[10px] font-mono text-accent-indigo uppercase tracking-wider block">
            {app.category} • RELEASE MANAGER
          </span>
          <h1 className="text-2xl font-bold font-display text-text-primary mt-0.5">
            {app.name} <span className="text-accent-indigo">Installer Registry</span>
          </h1>
          <p className="text-xs text-text-secondary font-mono mt-0.5">
            Package ID: <span className="text-text-primary font-medium">com.dayynime.{app.slug}</span>
          </p>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: List of Existing Releases */}
        <div className="lg:col-span-7 bg-bg-surface border border-bg-surface/40 rounded-lg p-5">
          <h2 className="text-sm font-mono text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers size={14} className="text-accent-indigo" />
            Existing Installers ({releases.length})
          </h2>

          {releases.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-bg-base rounded-md">
              <FileText size={28} className="text-text-secondary/40 mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-mono">No installer builds registered.</p>
              <p className="text-[11px] text-text-secondary/50 mt-1 max-w-xs mx-auto">
                Use the submission engine on the right to register the first release tag.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {releases.map((rel) => (
                <div
                  key={rel.id}
                  className={`bg-bg-base/40 border p-4 rounded-md transition-all ${
                    rel.is_latest
                      ? "border-accent-rose/30 bg-accent-rose/[0.01]"
                      : "border-bg-surface/50 hover:border-bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-text-primary bg-bg-surface px-2 py-1 rounded border border-bg-surface/60">
                        {rel.version}
                      </span>
                      {rel.is_latest && (
                        <span className="bg-accent-rose/15 text-accent-rose text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          LATEST
                        </span>
                      )}
                      {rel.file_size_mb && (
                        <span className="text-[10px] font-mono text-text-secondary">
                          {rel.file_size_mb} MB
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(rel)}
                        title="Edit changelog or asset URL"
                        className="bg-bg-surface hover:bg-bg-surface/80 border border-bg-surface/80 text-text-primary p-1.5 rounded transition-all text-xs flex items-center gap-1"
                      >
                        <Edit3 size={11} />
                        <span className="text-[10px]">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRelease(rel.id, rel.version)}
                        title="Remove installer build"
                        className="bg-bg-surface hover:bg-bg-surface/80 border border-bg-surface/80 text-accent-rose p-1.5 rounded transition-all text-xs flex items-center gap-1"
                      >
                        <Trash2 size={11} />
                        <span className="text-[10px]">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="mt-2.5 bg-bg-base/80 p-2 rounded border border-bg-surface/30 font-mono text-[10px] text-text-secondary truncate flex items-center gap-1.5">
                    <Download size={10} className="text-accent-indigo shrink-0" />
                    <span className="truncate">{rel.download_url}</span>
                  </div>

                  {/* Changelog lines */}
                  {rel.changelog && (
                    <div className="mt-2.5 border-t border-bg-surface/40 pt-2.5 text-xs text-text-secondary/80 font-body leading-relaxed max-h-[80px] overflow-y-auto pr-1">
                      <p className="font-mono text-[9px] text-text-secondary uppercase mb-1">Changelog Preview</p>
                      <p className="whitespace-pre-line text-[11px]">{rel.changelog}</p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="mt-2 text-[9px] font-mono text-text-secondary/50 flex items-center gap-1.5">
                    <Calendar size={10} />
                    Published: {new Date(rel.published_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Add/Edit Form */}
        <div className="lg:col-span-5 bg-bg-surface border border-bg-surface/40 rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-bg-base/60 pb-3 mb-4">
            <h2 className="text-sm font-mono text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={15} className="text-accent-indigo" />
              {editingReleaseId ? "Modify Installer Build" : "Register Installer Build"}
            </h2>
            {editingReleaseId && (
              <button
                onClick={handleCancelEdit}
                className="text-text-secondary hover:text-text-primary p-1 hover:bg-bg-base/60 rounded"
                title="Cancel editing and register a new release"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {error && (
            <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs p-3.5 rounded mb-4 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Version Input */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1 font-semibold">
                Release Version Tag
              </label>
              <input
                type="text"
                required
                placeholder="e.g. v2.4.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none px-3 py-2 rounded-md transition-all font-mono"
              />
              <p className="text-[9px] text-text-secondary/60 mt-1 font-mono">
                Tag format, typically semantic versions starting with a "v".
              </p>
            </div>

            {/* Download URL Input */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1 font-semibold">
                Direct Download Asset URL (APK Link)
              </label>
              <input
                type="url"
                required
                placeholder="e.g. https://github.com/dayynime/aniku-app/releases/download/v2.4.0/aniku.apk"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none px-3 py-2 rounded-md transition-all font-mono"
              />
              <div className="bg-bg-base/60 border border-bg-surface/50 p-2 rounded mt-1.5 text-[9px] font-mono text-text-secondary leading-normal flex items-start gap-1.5">
                <Info size={11} className="text-accent-indigo mt-0.5 shrink-0" />
                <p>
                  <span className="text-text-primary font-bold">Important:</span> Paste the <span className="text-accent-rose">DIRECT ASSET URL</span> ending in `.apk`. Do not use standard GitHub web release page links (`/releases/tag/...`).
                </p>
              </div>
            </div>

            {/* File Size Input */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1 font-semibold">
                File Size in Megabytes (MB)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 28.4"
                value={fileSizeMb}
                onChange={(e) => setFileSizeMb(e.target.value)}
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none px-3 py-2 rounded-md transition-all font-mono"
              />
              <p className="text-[9px] text-text-secondary/60 mt-1 font-mono">
                Decimals accepted. This metadata is shown on public storefronts.
              </p>
            </div>

            {/* Changelog Textarea */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1 font-semibold">
                Changelog Details
              </label>
              <textarea
                rows={5}
                placeholder="Describe new improvements, feature additions, or bug fixes (one point per line starting with a dash is recommended)..."
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none px-3 py-2 rounded-md transition-all font-body"
              />
            </div>

            {/* Latest Toggle */}
            <div className="bg-bg-base/30 border border-bg-surface p-3 rounded-md flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold font-display text-text-primary">Set as Latest</h4>
                <p className="text-[9px] text-text-secondary font-mono mt-0.5">
                  Autounsets any other releases of this app.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isLatest}
                onChange={(e) => setIsLatest(e.target.checked)}
                className="w-4 h-4 rounded border-bg-surface bg-bg-base text-accent-indigo focus:ring-accent-indigo focus:ring-opacity-25"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent-indigo text-text-primary text-xs font-bold py-2.5 rounded-md flex items-center justify-center gap-1.5 hover:bg-opacity-90 active:scale-98 transition-all disabled:opacity-50"
                id="btn-release-submit"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    {editingReleaseId ? "Save Build Edits" : "Register Release Build"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
