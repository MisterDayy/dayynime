export interface AppData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  is_published: boolean;
  created_at: string;
}

export interface ReleaseData {
  id: string;
  app_id: string;
  version: string;
  changelog: string;
  download_url: string;
  file_size_mb: number;
  is_latest: boolean;
  published_at: string;
}

export interface AdminData {
  id: string;
  created_at: string;
}
