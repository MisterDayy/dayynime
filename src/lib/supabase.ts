import { createClient } from "@supabase/supabase-js";
import { AppData, ReleaseData } from "../types";

// Detect Supabase environment variables from Vite or standard process.env
const SUPABASE_URL = 
  (import.meta as any).env.VITE_SUPABASE_URL || 
  (import.meta as any).env.NEXT_PUBLIC_SUPABASE_URL || 
  "";
const SUPABASE_ANON_KEY = 
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 
  (import.meta as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create actual Supabase client (only if credentials are available)
export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Mock database initial seed data for immediate demonstration
const SEED_APPS: AppData[] = [
  {
    id: "app-1",
    slug: "aniku",
    name: "Aniku Stream",
    description: "A high-performance Android application specialized in anime streaming. Supports dual audio, multi-subtitles, offline downloads, and customizable gesture-controlled video player. Stream your favorite anime seasons in up to 1080p resolution with zero subscription fees and an ad-free user interface.",
    icon_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=120&auto=format&fit=crop&q=80",
    category: "Anime Streamer",
    is_published: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "app-2",
    slug: "kuroflix",
    name: "Kuroflix",
    description: "The ultimate Asian drama and movie streaming application for mobile devices. Featuring a vast library of high-definition Korean, Japanese, and Chinese dramas, movies, and popular variety shows. Features smart bookmarks, user comments, and real-time episode schedule tracking.",
    icon_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&auto=format&fit=crop&q=80",
    category: "Movies & Drama",
    is_published: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "app-3",
    slug: "mangayomu",
    name: "MangaYomu Reader",
    description: "A lightweight, super-fast manga reading application designed specifically for Android. Sync your reading progress across devices, download chapters for fully offline reading, and pull from multiple high-quality indexers with clean, immersive page layouts.",
    icon_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80",
    category: "Manga Reader",
    is_published: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "app-4",
    slug: "lightnovel-hub",
    name: "NovelHub",
    description: "Access thousands of completed and ongoing light novels. Immersive reading mode, customized font rendering, adjustable text sizing, line spacing, dark background themes, and a clean interface designed to maximize eye comfort during long reading sessions.",
    icon_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=120&auto=format&fit=crop&q=80",
    category: "Novel Reader",
    is_published: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_RELEASES: ReleaseData[] = [
  {
    id: "rel-1-1",
    app_id: "app-1",
    version: "v2.4.0",
    changelog: "- Added H.265 hardware decoding acceleration\n- Fixed subtitle sync delays in multi-track audio files\n- Redesigned search bar with fast-indexing categories\n- Fixed crash on Android 14 devices during background audio download",
    download_url: "https://github.com/dayynime/aniku-app/releases/download/v2.4.0/aniku-v2.4.0.apk",
    file_size_mb: 28.4,
    is_latest: true,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rel-1-2",
    app_id: "app-1",
    version: "v2.3.1",
    changelog: "- Improved stream buffering algorithm\n- Updated video player library to latest Exoplayer stable release\n- Added option to toggle picture-in-picture mode manually",
    download_url: "https://github.com/dayynime/aniku-app/releases/download/v2.3.1/aniku-v2.3.1.apk",
    file_size_mb: 27.9,
    is_latest: false,
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rel-2-1",
    app_id: "app-2",
    version: "v1.8.5",
    changelog: "- Integrated backup CDNs for faster server handshakes\n- Implemented watch-together beta mode with link-sharing\n- Added light and dark AMOLED themes for OLED displays",
    download_url: "https://github.com/dayynime/kuroflix-app/releases/download/v1.8.5/kuroflix-v1.8.5.apk",
    file_size_mb: 34.2,
    is_latest: true,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rel-2-2",
    app_id: "app-2",
    version: "v1.8.0",
    changelog: "- Added automatic intro/outro skipping\n- Added multi-language subtitle localization\n- Fixed occasional memory leak in background caching thread",
    download_url: "https://github.com/dayynime/kuroflix-app/releases/download/v1.8.0/kuroflix-v1.8.0.apk",
    file_size_mb: 33.8,
    is_latest: false,
    published_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rel-3-1",
    app_id: "app-3",
    version: "v3.1.2",
    changelog: "- Fixed 403 image block errors on secondary manga indexer\n- Optimized database caching for offline libraries\n- Added custom vertical/horizontal webtoon scroll reader options",
    download_url: "https://github.com/dayynime/mangayomu/releases/download/v3.1.2/mangayomu-v3.1.2.apk",
    file_size_mb: 18.7,
    is_latest: true,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to initialize local storage for sandbox fallback
const initLocalStorage = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("dayynime_apps")) {
    localStorage.setItem("dayynime_apps", JSON.stringify(SEED_APPS));
  }
  if (!localStorage.getItem("dayynime_releases")) {
    localStorage.setItem("dayynime_releases", JSON.stringify(SEED_RELEASES));
  }
  if (!localStorage.getItem("dayynime_admin_logged_in")) {
    localStorage.setItem("dayynime_admin_logged_in", "false");
  }
};

initLocalStorage();

// Database service that transparently handles either real Supabase or Local Storage fallback
export const dbService = {
  // --- AUTH SERVICES ---
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: `Auth error: ${error.message} (status ${error.status ?? "?"})` };

      const uid = data.user?.id;

      // Check if this authenticated user exists in the public.admins table
      const { data: adminRecord, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", uid)
        .maybeSingle();

      if (adminError) {
        await supabase.auth.signOut();
        return { success: false, error: `Admin check failed: ${adminError.message} (code ${adminError.code}). Your UID: ${uid}` };
      }

      if (!adminRecord) {
        // Sign out if not an admin
        await supabase.auth.signOut();
        return { success: false, error: `Access Denied: UID ${uid} was not found in the admins table.` };
      }

      return { success: true, user: data.user };
    } else {
      // Local Sandbox login: accept demo credentials or any email ending with admin/password
      if (email.trim() === "admin@dayynime.store" && password === "password123") {
        localStorage.setItem("dayynime_admin_logged_in", "true");
        localStorage.setItem("dayynime_admin_email", email);
        return { success: true, user: { id: "sandbox-admin-id", email } };
      } else if (email.includes("admin") && password.length >= 6) {
        localStorage.setItem("dayynime_admin_logged_in", "true");
        localStorage.setItem("dayynime_admin_email", email);
        return { success: true, user: { id: "sandbox-admin-id", email } };
      } else {
        return { 
          success: false, 
          error: "Invalid credentials. Use 'admin@dayynime.store' and 'password123' for Sandbox mode." 
        };
      }
    }
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.setItem("dayynime_admin_logged_in", "false");
      localStorage.removeItem("dayynime_admin_email");
    }
  },

  async getCurrentUser(): Promise<any | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) return null;
      
      // Check if admin
      const { data: adminRecord } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.session.user.id)
        .single();

      if (!adminRecord) return null;
      return data.session.user;
    } else {
      const isLoggedIn = localStorage.getItem("dayynime_admin_logged_in") === "true";
      if (isLoggedIn) {
        const email = localStorage.getItem("dayynime_admin_email") || "admin@dayynime.store";
        return { id: "sandbox-admin-id", email };
      }
      return null;
    }
  },

  // --- APP SERVICES ---
  async getApps(includeUnpublished = false): Promise<AppData[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from("apps").select("*").order("created_at", { ascending: false });
      if (!includeUnpublished) {
        query = query.eq("is_published", true);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching apps from Supabase:", error);
        return [];
      }
      return data || [];
    } else {
      const appsStr = localStorage.getItem("dayynime_apps") || "[]";
      const apps: AppData[] = JSON.parse(appsStr);
      const sorted = apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (includeUnpublished) return sorted;
      return sorted.filter(a => a.is_published);
    }
  },

  async getAppBySlug(slug: string): Promise<AppData | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) {
        console.error("Error fetching app by slug:", error);
        return null;
      }
      return data;
    } else {
      const appsStr = localStorage.getItem("dayynime_apps") || "[]";
      const apps: AppData[] = JSON.parse(appsStr);
      return apps.find(a => a.slug === slug) || null;
    }
  },

  async getAppById(id: string): Promise<AppData | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching app by ID:", error);
        return null;
      }
      return data;
    } else {
      const appsStr = localStorage.getItem("dayynime_apps") || "[]";
      const apps: AppData[] = JSON.parse(appsStr);
      return apps.find(a => a.id === id) || null;
    }
  },

  async createApp(app: Omit<AppData, "id" | "created_at">): Promise<{ success: boolean; data?: AppData; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("apps")
        .insert([app])
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const appsStr = localStorage.getItem("dayynime_apps") || "[]";
      const apps: AppData[] = JSON.parse(appsStr);
      
      if (apps.some(a => a.slug === app.slug)) {
        return { success: false, error: "An app with this slug already exists." };
      }

      const newApp: AppData = {
        ...app,
        id: "app-" + Date.now(),
        created_at: new Date().toISOString()
      };
      apps.push(newApp);
      localStorage.setItem("dayynime_apps", JSON.stringify(apps));
      return { success: true, data: newApp };
    }
  },

  async updateApp(id: string, app: Partial<AppData>): Promise<{ success: boolean; data?: AppData; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("apps")
        .update(app)
        .eq("id", id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const appsStr = localStorage.getItem("dayynime_apps") || "[]";
      const apps: AppData[] = JSON.parse(appsStr);
      const index = apps.findIndex(a => a.id === id);
      if (index === -index - 1 || index === -1) return { success: false, error: "App not found." };
      
      if (app.slug && apps.some(a => a.slug === app.slug && a.id !== id)) {
        return { success: false, error: "An app with this slug already exists." };
      }

      const updatedApp = { ...apps[index], ...app };
      apps[index] = updatedApp;
      localStorage.setItem("dayynime_apps", JSON.stringify(apps));
      return { success: true, data: updatedApp };
    }
  },

  async deleteApp(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("apps").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const appsStr = localStorage.getItem("dayynime_apps") || "[]";
      const apps: AppData[] = JSON.parse(appsStr);
      const filtered = apps.filter(a => a.id !== id);
      localStorage.setItem("dayynime_apps", JSON.stringify(filtered));

      // Cascade delete releases
      const relsStr = localStorage.getItem("dayynime_releases") || "[]";
      const rels: ReleaseData[] = JSON.parse(relsStr);
      const filteredRels = rels.filter(r => r.app_id !== id);
      localStorage.setItem("dayynime_releases", JSON.stringify(filteredRels));

      return { success: true };
    }
  },

  // --- RELEASES SERVICES ---
  async getReleases(appId: string): Promise<ReleaseData[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("releases")
        .select("*")
        .eq("app_id", appId)
        .order("published_at", { ascending: false });
      if (error) {
        console.error("Error fetching releases from Supabase:", error);
        return [];
      }
      return data || [];
    } else {
      const relsStr = localStorage.getItem("dayynime_releases") || "[]";
      const rels: ReleaseData[] = JSON.parse(relsStr);
      return rels
        .filter(r => r.app_id === appId)
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
  },

  async createRelease(release: Omit<ReleaseData, "id" | "published_at">): Promise<{ success: boolean; data?: ReleaseData; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("releases")
        .insert([release])
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const relsStr = localStorage.getItem("dayynime_releases") || "[]";
      let rels: ReleaseData[] = JSON.parse(relsStr);

      const newRelease: ReleaseData = {
        ...release,
        id: "rel-" + Date.now(),
        published_at: new Date().toISOString()
      };

      // Handle is_latest auto-toggle
      if (newRelease.is_latest) {
        rels = rels.map(r => {
          if (r.app_id === newRelease.app_id) {
            return { ...r, is_latest: false };
          }
          return r;
        });
      }

      rels.push(newRelease);
      localStorage.setItem("dayynime_releases", JSON.stringify(rels));
      return { success: true, data: newRelease };
    }
  },

  async updateRelease(id: string, release: Partial<ReleaseData>): Promise<{ success: boolean; data?: ReleaseData; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("releases")
        .update(release)
        .eq("id", id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } else {
      const relsStr = localStorage.getItem("dayynime_releases") || "[]";
      let rels: ReleaseData[] = JSON.parse(relsStr);
      const index = rels.findIndex(r => r.id === id);
      if (index === -1) return { success: false, error: "Release not found." };

      const appId = rels[index].app_id;
      const updatedRelease = { ...rels[index], ...release };

      // Handle is_latest auto-toggle
      if (updatedRelease.is_latest) {
        rels = rels.map((r, idx) => {
          if (r.app_id === appId && idx !== index) {
            return { ...r, is_latest: false };
          }
          return r;
        });
      }

      rels[index] = updatedRelease;
      localStorage.setItem("dayynime_releases", JSON.stringify(rels));
      return { success: true, data: updatedRelease };
    }
  },

  async deleteRelease(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("releases").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const relsStr = localStorage.getItem("dayynime_releases") || "[]";
      const rels: ReleaseData[] = JSON.parse(relsStr);
      const filtered = rels.filter(r => r.id !== id);
      localStorage.setItem("dayynime_releases", JSON.stringify(filtered));
      return { success: true };
    }
  }
};
