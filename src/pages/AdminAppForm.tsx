import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { dbService } from "../lib/supabase";
import { AppData } from "../types";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Link2, 
  Tag, 
  Compass,
  CheckCircle
} from "lucide-react";

export const AdminAppForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [iconUrl, setIconUrl] = useState<string>("");
  const [category, setCategory] = useState<string>("Anime Streamer");
  const [isPublished, setIsPublished] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically generate slugs from names on typing, if not in edit mode and the slug hasn't been manually adjusted
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState<boolean>(false);

  useEffect(() => {
    const fetchAppDetail = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const app = await dbService.getAppById(id);
        if (app) {
          setName(app.name);
          setSlug(app.slug);
          setDescription(app.description || "");
          setIconUrl(app.icon_url || "");
          setCategory(app.category || "Anime Streamer");
          setIsPublished(app.is_published);
          setManuallyEditedSlug(true);
        } else {
          setError("Requested app registration not found.");
        }
      } catch (err: any) {
        console.error("Fetch app detail for edit failed:", err);
        setError("Failed to load app registry for editing.");
      } finally {
        setFetching(false);
      }
    };
    fetchAppDetail();
  }, [id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    
    // Auto-slugify name if we haven't manually edited the slug
    if (!isEditMode && !manuallyEditedSlug) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special characters
        .replace(/\s+/g, "-")         // replace spaces with hyphens
        .replace(/-+/g, "-");         // remove consecutive hyphens
      setSlug(generatedSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, ""));
    setManuallyEditedSlug(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!name.trim()) {
      setError("App name is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug URL parameter is required.");
      return;
    }
    if (!iconUrl.trim()) {
      setError("Icon image URL is required to maintain professional visual styling.");
      return;
    }

    setLoading(true);
    const appPayload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      icon_url: iconUrl.trim(),
      category: category.trim(),
      is_published: isPublished
    };

    try {
      if (isEditMode && id) {
        const res = await dbService.updateApp(id, appPayload);
        if (res.success) {
          navigate("/admin");
        } else {
          setError(res.error || "Failed to update application.");
        }
      } else {
        const res = await dbService.createApp(appPayload);
        if (res.success) {
          navigate("/admin");
        } else {
          setError(res.error || "Failed to create application entry.");
        }
      }
    } catch (err: any) {
      console.error("Submit form failed:", err);
      setError(err?.message || "An unexpected error occurred saving this package.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-text-secondary">Retrieving registry database records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" id="admin-app-form">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-accent-indigo transition-all"
        >
          <ArrowLeft size={14} />
          CANCEL AND RETURN TO DASHBOARD
        </Link>
      </div>

      <div className="bg-bg-surface border border-bg-surface/50 rounded-lg p-6 sm:p-8">
        {/* Title */}
        <div className="border-b border-bg-base/60 pb-5 mb-6">
          <h2 className="text-xl font-bold font-display text-text-primary">
            {isEditMode ? "Modify App Specifications" : "Register New Android App"}
          </h2>
          <p className="text-xs text-text-secondary mt-1 font-mono">
            {isEditMode ? "Updating record for com.dayynime." + slug : "Configure core metadata fields for public store listing."}
          </p>
        </div>

        {error && (
          <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs p-3.5 rounded mb-6 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error:</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grid Name & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* App Name */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5 font-semibold">
                Application Name
              </label>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aniku Stream"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none pl-9 pr-4 py-2.5 rounded-md transition-all font-body"
                />
              </div>
              <p className="text-[10px] text-text-secondary/60 mt-1 font-mono">
                The public name displayed across homepage shelves and titles.
              </p>
            </div>

            {/* URL Slug */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5 font-semibold">
                URL Identifier / Slug
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                <input
                  type="text"
                  required
                  disabled={isEditMode}
                  placeholder="e.g. aniku"
                  value={slug}
                  onChange={handleSlugChange}
                  className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none pl-9 pr-4 py-2.5 rounded-md transition-all font-mono disabled:opacity-60 disabled:pointer-events-none"
                />
              </div>
              <p className="text-[10px] text-text-secondary/60 mt-1 font-mono">
                Used in URL bar: <span className="text-accent-indigo">dayynime.store/app/{slug || "slug"}</span>
              </p>
            </div>
          </div>

          {/* Icon and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category selection */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5 font-semibold">
                Category Group
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none px-4 py-2.5 rounded-md transition-all font-mono"
              >
                <option value="Anime Streamer">Anime Streamer</option>
                <option value="Movies & Drama">Movies & Drama</option>
                <option value="Manga Reader">Manga Reader</option>
                <option value="Novel Reader">Novel Reader</option>
                <option value="General Utilities">General Utilities</option>
              </select>
              <p className="text-[10px] text-text-secondary/60 mt-1 font-mono">
                Categorizes this package to facilitate homepage tab filtering.
              </p>
            </div>

            {/* Icon URL */}
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5 font-semibold">
                Icon URL / Cover Link
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                <input
                  type="url"
                  required
                  placeholder="e.g. https://images.unsplash.com/..."
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none pl-9 pr-4 py-2.5 rounded-md transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-text-secondary/60 mt-1 font-mono">
                Image link. Copy any Unsplash photo or CDN path for the app logo.
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5 font-semibold">
              Full Overview Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-text-secondary" size={14} />
              <textarea
                rows={5}
                required
                placeholder="Describe features, key specifications, custom options, and technical constraints of the app..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none pl-9 pr-4 py-2.5 rounded-md transition-all font-body"
              />
            </div>
            <p className="text-[10px] text-text-secondary/60 mt-1 font-mono">
              The primary body prose describing the utility. Supports text wrapping.
            </p>
          </div>

          {/* Status and Active Toggles */}
          <div className="bg-bg-base/40 border border-bg-surface/50 p-4 rounded-md flex items-center justify-between">
            <div className="flex gap-2">
              <CheckCircle size={16} className="text-accent-indigo shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold font-display text-text-primary">Publish Publicly</h4>
                <p className="text-[10px] text-text-secondary font-mono mt-0.5">
                  If toggled off, the app will save as a Draft and remain hidden from public shelves.
                </p>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`px-4 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                  isPublished
                    ? "bg-accent-indigo text-text-primary"
                    : "bg-bg-surface text-text-secondary border border-bg-surface/60"
                }`}
              >
                {isPublished ? "PUBLISH ACTIVE" : "DRAFT MODE"}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-bg-surface/30 mt-6">
            <Link
              to="/admin"
              className="bg-bg-surface hover:bg-bg-surface/80 text-text-primary border border-bg-surface text-xs font-medium px-4 py-2 rounded-md transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-accent-indigo text-text-primary text-xs font-bold px-5 py-2 rounded-md flex items-center gap-1.5 hover:bg-opacity-90 active:scale-98 transition-all disabled:opacity-50"
              id="btn-app-submit"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} />
                  Save App Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
