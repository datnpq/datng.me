/**
 * Nhạc nền cho máy nghe nhạc (src/components/MusicPlayer.astro).
 * Chỉ cần YouTube video id (phần sau `v=`). Phát qua YouTube IFrame API nên
 * không phải host file nhạc. Đổi mùa thì đổi danh sách ở đây.
 */
export type Track = { id: string; title: string; artist: string };

export const PLAYLIST_NAME = "🎄 Nhạc Giáng sinh";

export const PLAYLIST: Track[] = [
  { id: "E8gmARGvPlI", title: "Last Christmas", artist: "Wham!" },
  {
    id: "aAkMkVFwAoo",
    title: "All I Want for Christmas Is You",
    artist: "Mariah Carey",
  },
  { id: "nlR0MkrRklg", title: "Santa Tell Me", artist: "Ariana Grande" },
  { id: "EM2Fnp_qnE8", title: "Underneath the Tree", artist: "Kelly Clarkson" },
  {
    id: "0bhsXykXxfg",
    title: "It's Beginning to Look a Lot Like Christmas",
    artist: "Michael Bublé",
  },
  { id: "N8NcQzMQN_U", title: "Feliz Navidad", artist: "José Feliciano" },
  { id: "J_QGZspO4gg", title: "Snowman", artist: "Sia" },
];
