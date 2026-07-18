import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { AppDetail } from "./pages/AppDetail";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminAppForm } from "./pages/AdminAppForm";
import { AdminReleases } from "./pages/AdminReleases";
import { Github } from "lucide-react";
import { LiveDot } from "./components/LiveDot";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-between selection:bg-accent-indigo/30 selection:text-text-primary">

        {/* GLOBAL HEADER BAR */}
        <header className="border-b border-bg-raised bg-bg-base/90 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/icon-192.png"
                alt="Dayynime"
                className="w-8 h-8 rounded-md object-cover border border-bg-raised"
              />
              <span className="font-mono text-sm font-semibold tracking-tight text-text-primary">
                dayynime<span className="text-text-secondary">/</span>
                <span className="group-hover:text-accent-indigo transition-colors">store</span>
              </span>
            </Link>

            {/* Status + Navigation */}
            <div className="flex items-center gap-5 text-xs font-mono text-text-secondary">
              <LiveDot label="store online" />
              <Link
                to="/"
                className="hover:text-accent-indigo transition-colors hidden sm:inline"
              >
                directory
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
        <footer className="border-t border-bg-raised py-10 mt-16 font-mono text-xs text-text-secondary">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span>© {new Date().getFullYear()} dayynime/store</span>
              <a
                href="https://github.com/dayynime"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-accent-indigo transition-colors"
              >
                <Github size={13} />
                github.com/dayynime
              </a>
            </div>

            <p className="leading-relaxed max-w-2xl text-text-secondary/80 border-t border-bg-raised pt-5">
              Every build listed here is a direct GitHub Releases asset — no wrappers, no ad
              gates, no waiting screens. What you tap is the file you get.
            </p>
          </div>
        </footer>

      </div>
    </Router>
  );
}
