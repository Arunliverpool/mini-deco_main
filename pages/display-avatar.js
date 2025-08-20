// pages/display-avatar.js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import Script from "next/script";

// Extract avatar id from GLB URL (…/<ID>.glb)
const getAvatarId = (glbUrl) => {
  try {
    const last = new URL(glbUrl).pathname.split("/").pop() || "";
    return last.replace(".glb", "");
  } catch {
    return "";
  }
};

// Build multiple candidate render URLs (covers RPM variants)
const buildRenderCandidates = (glbUrl, { scene, size }) => {
  const avatarId = getAvatarId(glbUrl);
  const enc = encodeURIComponent(glbUrl);

  // Prefer ID-based endpoints
  const idCandidates = avatarId
    ? [
        // v2 renderer
        `https://render.readyplayer.me/v2/avatars/${avatarId}.png?scene=${scene}&size=${size}&pose=T&armature=ARP`,
        // v1 API
        `https://api.readyplayer.me/v1/avatars/${avatarId}.png?scene=${scene}&size=${size}&pose=T&armature=ARP`,
        // legacy
        `https://render.readyplayer.me/v1/avatars/${avatarId}.png?scene=${scene}&size=${size}&pose=T&armature=ARP`,
      ]
    : [];

  // Fallback to URL-param variants
  const urlCandidates = [
    `https://render.readyplayer.me/render?url=${enc}&scene=${scene}&size=${size}&format=png&pose=T&armature=ARP`,
    `https://render.readyplayer.me/render?model=${enc}&scene=${scene}&size=${size}&format=png&pose=T&armature=ARP`,
    `https://render.readyplayer.me/render.png?model=${enc}&scene=${scene}&size=${size}&pose=T&armature=ARP`,
    `https://render.readyplayer.me/render?model=${enc}&scene=${scene}&size=${size}&pose=T&armature=ARP`,
  ];

  return [...idCandidates, ...urlCandidates];
};

export default function DisplayAvatar() {
  const router = useRouter();
  const { id } = router.query; // this is your DB row id, not the avatar id

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [full, setFull] = useState(false);
  const [idx, setIdx] = useState(0);
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setRow(data);
      setLoading(false);
    })();
  }, [id]);

  const candidates = useMemo(() => {
    if (!row?.avatar_url) return [];
    const scene = full
      ? "fullbody-portrait-v1-transparent"
      : "halfbody-portrait-v1-transparent";
    const size = full ? 800 : 512;
    const list = buildRenderCandidates(row.avatar_url, { scene, size });
    console.log("Render candidates:", list);
    return list;
  }, [row?.avatar_url, full]);

  useEffect(() => {
    setIdx(0);
    setUse3D(false);
  }, [candidates.length]);

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;
  if (!row) return <p style={{ padding: 24 }}>Not found</p>;

  const src = candidates[idx];

  const onImgError = () => {
    const hasNext = idx + 1 < candidates.length;
    if (hasNext) setIdx(idx + 1);
    else setUse3D(true);
  };

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <Script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" />
      <h1>Your avatar</h1>

      <div
        style={{
          background: "#111",
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
          minHeight: 160,
        }}
      >
        {!use3D ? (
          <img
            src={src}
            alt="avatar"
            style={{ maxWidth: "100%", height: "auto" }}
            onError={onImgError}
            referrerPolicy="no-referrer"
          />
        ) : (
          <>
            <p style={{ color: "#fff", marginBottom: 8 }}>
              Image render failed — showing 3D instead.
            </p>
            {/* @ts-ignore custom element */}
            <model-viewer
              src={row.avatar_url}
              alt="Avatar 3D"
              auto-rotate
              camera-controls
              style={{ width: "100%", height: 420, background: "#111", borderRadius: 12 }}
            />
          </>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setFull((v) => !v)}>
          {full ? "Show portrait" : "Show full body"}
        </button>
        <a href={row.avatar_url} target="_blank" rel="noreferrer" style={{ marginLeft: 12 }}>
          View 3D model (GLB)
        </a>
      </div>

      <div style={{ color: "#666", fontSize: 12, marginTop: 8 }}>
        {use3D ? "Using 3D fallback." : `Trying image URL ${idx + 1} of ${candidates.length}.`}
      </div>
    </main>
  );
}
