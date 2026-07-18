import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { AppDetail } from "./pages/AppDetail";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminAppForm } from "./pages/AdminAppForm";
import { AdminReleases } from "./pages/AdminReleases";
import { ShieldAlert, Download, Heart, Github } from "lucide-react";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between selection:bg-accent-indigo/30 selection:text-text-primary">
        
        {/* GLOBAL HEADER BAR */}
        <header className="border-b border-bg-surface bg-bg-base/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-md bg-accent-indigo flex items-center justify-center text-bg-base font-bold font-display tracking-tighter group-hover:scale-102 transition-transform">
                D
              </div>
              <div>
                <span className="font-bold tracking-tight font-display text-text-primary group-hover:text-accent-indigo transition-colors">
                  Dayynime
                </span>
                <span className="text-[10px] font-mono text-accent-indigo block -mt-1 font-semibold uppercase">
                  STOREFRONT
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <div className="flex items-center gap-5 text-xs font-mono">
              <Link 
                to="/" 
                className="text-text-secondary hover:text-text-primary transition-colors hidden sm:block"
              >
                APP DIRECTORY
              </Link>
            </div>
          </div>
        </header>

        {/* MAIN BODY LAYOUT ROUTER */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/app/:slug" element={<AppDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/apps/new" element={<AdminAppForm />} />
            <Route path="/admin/apps/:id/edit" element={<AdminAppForm />} />
            <Route path="/admin/apps/:id/releases" element={<AdminReleases />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* GLOBAL FOOTER BAR */}
        <footer className="bg-bg-surface/40 border-t border-bg-surface py-8 mt-12 text-center text-text-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span>© {new Date().getFullYear()} Dayynime Store. All rights reserved.</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-accent-rose bg-accent-rose/5 px-2 py-0.5 rounded border border-accent-rose/10 uppercase tracking-widest font-bold">
                  v2.0 STABLE
                </span>
                <span className="hidden sm:inline">Direct CDN Package Links</span>
              </div>
            </div>

            <div className="pt-4 border-t border-bg-surface/30 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2.5">
              <p className="leading-relaxed text-left max-w-xl">
                Dayynime Store is a safe database index for trusted open-source and third-party Android streaming apk packages. All files are hosted directly via GitHub Releases.
              </p>
              
              <div className="flex items-center gap-1 shrink-0">
                <span>Refined with</span>
                <Heart size={10} className="text-accent-rose fill-accent-rose" />
                <span>for the Android Streaming Community</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}
