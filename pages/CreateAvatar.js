// pages/create-avatar.js
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function CreateAvatar() {
  const router = useRouter();
  const frameRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // RPM render URL helper (2D image from GLB)
  const render2D = (
    avatarUrl,
    { scene = "halfbody-portrait-v1-transparent", size = 512 } = {}
  ) =>
    `https://render.readyplayer.me/render?url=${encodeURIComponent(
      avatarUrl
    )}&scene=${scene}&size=${size}&format=png&pose=T&armature=ARP`;

  const postToFrame = (payload) => {
    try {
      frameRef.current?.contentWindow?.postMessage(payload, "*");
    } catch (e) {
      console.error("postMessage failed:", e);
    }
  };

  useEffect(() => {
    const onMessage = async (event) => {
      const isRPM =
        typeof event.origin === "string" &&
        (event.origin.endsWith(".readyplayer.me") ||
          event.origin.includes("readyplayer"));
      if (!isRPM || !event.data) return;

      const msg = event.data;

      // 1) Subscribe after frame ready
      if (msg.source === "readyplayerme" && msg.eventName === "v1.frame.ready") {
        postToFrame({
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.avatar.exported",
        });
        return;
      }

      // 2) Handle avatar exported
      if (msg.source === "readyplayerme" && msg.eventName === "v1.avatar.exported") {
        const avatarUrl = msg?.data?.url || msg?.url;
        if (!avatarUrl || done || saving) return;

        try {
          setSaving(true);
          setDone(true);

          const portrait = render2D(avatarUrl, {
            scene: "halfbody-portrait-v1-transparent",
            size: 512,
          });
          const fullbody = render2D(avatarUrl, {
            scene: "fullbody-portrait-v1-transparent",
            size: 800,
          });

          // ⬇️ No user_id field at all
          const payload = {
            avatar_url: avatarUrl,
            avatar_name: "My Avatar",
            render_url_portrait: portrait,
            render_url_fullbody: fullbody,
          };
          console.log("DEV insert payload (auto):", payload);

          const { data, error } = await supabase
            .from("user_avatars")
            .insert([payload])
            .select()
            .single();

          if (error) throw error;
          router.push(`/display-avatar?id=${data.id}`);
        } catch (err) {
          console.error(err);
          alert(`Failed to save avatar: ${err.message}`);
          setSaving(false);
          setDone(false);
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router, saving, done]);

  // Manual fallback if events don’t fire (copy GLB URL from RPM UI)
  const manualSave = async () => {
    const avatarUrl = prompt(
      "Paste your avatar URL (https://models.readyplayer.me/....glb)"
    );
    if (!avatarUrl) return;
    try {
      setSaving(true);
      const portrait = render2D(avatarUrl, {
        scene: "halfbody-portrait-v1-transparent",
        size: 512,
      });
      const fullbody = render2D(avatarUrl, {
        scene: "fullbody-portrait-v1-transparent",
        size: 800,
      });

      // ⬇️ No user_id field at all
      const payload = {
        avatar_url: avatarUrl,
        avatar_name: "My Avatar",
        render_url_portrait: portrait,
        render_url_fullbody: fullbody,
      };
      console.log("DEV insert payload (manual):", payload);

      const { data, error } = await supabase
        .from("user_avatars")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      router.push(`/display-avatar?id=${data.id}`);
    } catch (e) {
      alert(e.message);
      setSaving(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>Create your avatar</h1>
      <p>Finish in the builder; we’ll auto-save and redirect.</p>

      <iframe
        ref={frameRef}
        src="https://demo.readyplayer.me/avatar?frameApi"
        allow="camera *; microphone *"
        width="100%"
        height="680"
        style={{ border: "0", borderRadius: 12, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
      />

      <div style={{ marginTop: 16 }}>
        <button onClick={manualSave}>Manual save (paste GLB)</button>
      </div>

      {saving && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
          }}
        >
          <div>
            <h2>Saving your avatar…</h2>
          </div>
        </div>
      )}
    </main>
  );
}
