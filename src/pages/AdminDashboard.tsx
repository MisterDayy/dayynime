import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppData, ReleaseData } from "../types";
import { dbService } from "../lib/supabase";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  FileCode, 
  Eye, 
  EyeOff, 
  LogOut, 
  Settings, 
  FolderPlus,
  RefreshCw,
  Home,
  CheckCircle,
  Database
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppData[]>([]);
  const [releasesCount, setReleasesCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  // Authentication guard
  useEffect(() => {
    const authenticate = async () => {
      setLoading(true);
      const user = await dbService.getCurrentUser();
      if (!user) {
        navigate("/admin/login");
      } else {
        setAdminUser(user);
        await loadDashboardData();
      }
    };
    authenticate();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Fetch ALL apps (published + drafts)
      const allApps = await dbService.getApps(true);
      setApps(allApps);

      // Fetch release count for each app
      const counts: Record<string, number> = {};
      for (const app of allApps) {
        const appRels = await dbService.getReleases(app.id);
        counts[app.id] = appRels.length;
      }
      setReleasesCount(counts);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await dbService.updateApp(id, { is_published: !currentStatus });
      if (res.success) {
        setApps(prev => prev.map(a => a.id === id ? { ...a, is_published: !currentStatus } : a));
      } else {
        alert("Failed to update status: " + res.error);
      }
    } catch (err) {
      console.error("Toggle publish error:", err);
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${name}"? This will permanently delete the app and all of its associated releases.`)) {
      return;
    }

    try {
      const res = await dbService.deleteApp(id);
      if (res.success) {
        setApps(prev => prev.filter(a => a.id !== id));
      } else {
        alert("Failed to delete app: " + res.error);
      }
    } catch (err) {
      console.error("Delete app error:", err);
    }
  };

  const handleLogout = async () => {
    await dbService.logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-text-secondary">Verifying secure admin session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-dashboard">
      
      {/* 1. Dashboard Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-bg-surface pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-text-secondary font-mono">
            <Settings size={12} className="text-accent-indigo" />
            <span>STORE ADMINISTRATION CONTROL PANEL</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-text-primary">
            Storefront Catalog <span className="text-accent-indigo">Console</span>
          </h1>
          {adminUser && (
            <p className="text-xs text-text-secondary mt-1">
              Logged in as: <span className="text-text-primary font-mono font-medium">{adminUser.email}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 bg-bg-surface hover:bg-bg-surface/80 text-text-primary border border-bg-surface/80 text-xs px-3 py-2 rounded-md transition-all font-medium"
          >
            <Home size={13} />
            Public View
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-accent-rose/10 hover:bg-accent-rose text-accent-rose hover:text-bg-base border border-accent-rose/20 text-xs px-3 py-2 rounded-md transition-all font-medium"
          >
            <LogOut size={13} />
            Log Out
          </button>
        </div>
      </div>

      {/* 2. Main Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg-surface border border-bg-surface/50 p-4 rounded-lg">
          <span className="text-[10px] font-mono text-text-secondary uppercase">Total Repositories</span>
          <p className="text-2xl font-bold text-text-primary mt-1 font-display">{apps.length}</p>
        </div>
        <div className="bg-bg-surface border border-bg-surface/50 p-4 rounded-lg">
          <span className="text-[10px] font-mono text-text-secondary uppercase">Active Published</span>
          <p className="text-2xl font-bold text-accent-indigo mt-1 font-display">
            {apps.filter(a => a.is_published).length}
          </p>
        </div>
        <div className="bg-bg-surface border border-bg-surface/50 p-4 rounded-lg">
          <span className="text-[10px] font-mono text-text-secondary uppercase">Total Installers</span>
          <p className="text-2xl font-bold text-accent-rose mt-1 font-display">
            {Object.values(releasesCount).reduce((a: number, b: number) => a + b, 0)}
          </p>
        </div>
      </div>

      {/* 3. Catalog Listing Header and Create Trigger */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          Managed Apps Directory ({apps.length})
        </h3>
        <Link
          to="/admin/apps/new"
          className="bg-accent-indigo text-text-primary text-xs font-bold px-4 py-2 rounded-md flex items-center gap-1.5 hover:bg-opacity-90 transition-all shadow-md shadow-accent-indigo/10"
          id="btn-add-app"
        >
          <Plus size={14} />
          Register New App
        </Link>
      </div>

      {/* 4. Directory Grid */}
      {apps.length === 0 ? (
        <div className="text-center py-24 bg-bg-surface/30 border border-dashed border-bg-surface rounded-lg">
          <Database size={40} className="text-text-secondary/30 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-text-primary font-display">Directory Empty</h4>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            You haven't registered any Android applications in your catalog directory yet.
          </p>
          <Link
            to="/admin/apps/new"
            className="mt-4 inline-flex items-center gap-1.5 bg-accent-indigo text-text-primary text-xs font-semibold px-4 py-2 rounded hover:bg-opacity-90 transition-all"
          >
            <Plus size={14} />
            Add First App
          </Link>
        </div>
      ) : (
        <div className="bg-bg-surface border border-bg-surface/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-base/40 text-text-secondary text-[10px] uppercase font-mono tracking-wider border-b border-bg-surface/60">
                  <th className="py-4 px-6">App Info</th>
                  <th className="py-4 px-4">Package Tag / Slug</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Build Counts</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-surface/40 text-xs">
                {apps.map((app) => {
                  const buildCount = releasesCount[app.id] || 0;
                  return (
                    <tr 
                      key={app.id} 
                      className="hover:bg-bg-base/20 transition-all duration-150"
                      id={`admin-row-${app.slug}`}
                    >
                      {/* Logo and Name */}
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.icon_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100"}
                            alt={app.name}
                            className="w-10 h-10 object-cover rounded-md border border-bg-base"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100";
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-text-primary font-display truncate">
                              {app.name}
                            </h4>
                            <p className="text-[11px] text-text-secondary/70 truncate max-w-[200px]">
                              {app.description || "No description loaded."}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Package slug */}
                      <td className="py-4 px-4 font-mono text-text-secondary">
                        <span className="text-[11px] block">com.dayynime.{app.slug}</span>
                        <span className="text-[9px] text-text-secondary/50 block mt-0.5">{app.slug}</span>
                      </td>

                      {/* Category tag */}
                      <td className="py-4 px-4">
                        <span className="bg-bg-base/70 border border-bg-surface/50 text-text-secondary px-2 py-1 rounded text-[10px] font-mono">
                          {app.category}
                        </span>
                      </td>

                      {/* Release count */}
                      <td className="py-4 px-4 font-mono font-medium text-text-primary">
                        <span className="inline-flex items-center gap-1.5">
                          <FileCode size={13} className="text-accent-indigo" />
                          {buildCount} build{buildCount !== 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Publish Toggle Button */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleTogglePublish(app.id, app.is_published)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-medium transition-all ${
                            app.is_published
                              ? "bg-accent-indigo/15 border border-accent-indigo/30 text-accent-indigo"
                              : "bg-bg-base/70 border border-bg-surface/80 text-text-secondary"
                          }`}
                          title="Click to toggle publication status"
                        >
                          {app.is_published ? (
                            <>
                              <Eye size={11} />
                              PUBLISHED
                            </>
                          ) : (
                            <>
                              <EyeOff size={11} />
                              DRAFT
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            to={`/admin/apps/${app.id}/releases`}
                            className="bg-bg-base border border-bg-surface hover:border-accent-indigo text-text-primary text-[11px] px-2.5 py-1.5 rounded transition-all flex items-center gap-1 font-medium"
                          >
                            <Layers size={11} className="text-accent-indigo" />
                            Manage Releases
                          </Link>
                          
                          <Link
                            to={`/admin/apps/${app.id}/edit`}
                            title="Edit general meta details"
                            className="bg-bg-base border border-bg-surface hover:border-accent-indigo text-text-primary p-1.5 rounded transition-all"
                          >
                            <Edit3 size={12} />
                          </Link>

                          <button
                            onClick={() => handleDeleteApp(app.id, app.name)}
                            title="Permanently remove application"
                            className="bg-bg-base border border-bg-surface hover:border-accent-rose text-accent-rose p-1.5 rounded transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
