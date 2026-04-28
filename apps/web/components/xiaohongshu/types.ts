export interface XhsAuthor {
  id: string;
  name: string;
  avatar: string;
  desc?: string;
}

export interface XhsNote {
  id: string;
  title: string;
  desc: string;
  cover: string;
  author: XhsAuthor;
  tags: string[];
  liked_count: string;
  comment_count: string;
  type: string;
  created_at: number;
}

export interface XhsNoteDetail extends XhsNote {
  images: string[];
  video_url?: string;
  collect_count: string;
  ip_location: string;
}

export interface XhsUser {
  id: string;
  name: string;
  avatar: string;
  desc: string;
  gender: number;
  ip_location: string;
  follows: string;
  fans: string;
  interaction: string;
  tags: string[];
}

export interface SearchState {
  query: string;
  sort: string;
  note_type: number;
  page: number;
}
