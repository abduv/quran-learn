import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../lib/firebase";
import type { VideoSource } from "../lib/types";

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.slice(1);
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id)
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    }
  } catch {
    return null;
  }
  return null;
}

export default function VideoPlayer({ source }: { source: VideoSource }) {
  const [storageUrl, setStorageUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (source.kind === "storage") {
      getDownloadURL(ref(storage, source.path))
        .then((u) => alive && setStorageUrl(u))
        .catch((e) => alive && setErr(e instanceof Error ? e.message : String(e)));
    }
    return () => {
      alive = false;
    };
  }, [source]);

  if (source.kind === "youtube") {
    const embed = youtubeEmbed(source.url);
    if (!embed) return <div className="text-berry-500">Invalid YouTube URL</div>;
    return (
      <div className="aspect-video rounded-3xl overflow-hidden shadow-kid bg-black">
        <iframe
          src={embed}
          title="lesson"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (err) return <div className="text-berry-500">{err}</div>;
  if (!storageUrl)
    return (
      <div className="aspect-video rounded-3xl bg-ink-800/5 grid place-items-center">
        ...
      </div>
    );

  return (
    <div className="aspect-video rounded-3xl overflow-hidden shadow-kid bg-black">
      <video
        src={storageUrl}
        controls
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full"
      />
    </div>
  );
}
