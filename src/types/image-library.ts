export interface DefaultImage {
  id: string;
  name: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  tags: string[] | null;
  created_at: string;
}

export interface UserImage {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}
