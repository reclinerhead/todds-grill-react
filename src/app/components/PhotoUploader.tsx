// src/components/PhotoUploader.tsx
"use client";

import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { createClient } from "@/lib/supabase/client";

const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

export default function PhotoUploader() {
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<InstanceType<typeof HCaptcha> | null>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!captchaToken) {
      setStatus("Error: Please complete the captcha first.");
      return;
    }

    setUploading(true);
    setStatus("Uploading...");

    try {
      // getUser() validates the JWT with the Supabase server (unlike getSession()
      // which only reads localStorage and can return stale/invalid sessions).
      let {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("[PhotoUploader] existing user:", user?.id ?? "none");

      if (!user) {
        console.log(
          "[PhotoUploader] no valid session – signing in anonymously",
        );
        const { data: authData, error: authError } =
          await supabase.auth.signInAnonymously({
            options: { captchaToken },
          });
        console.log(
          "[PhotoUploader] signInAnonymously result:",
          authData?.user?.id,
          authError,
        );
        if (authError) throw authError;
        user = authData.user;
      }

      if (!user)
        throw new Error("Could not establish an authenticated session.");

      // Reset captcha after use
      setCaptchaToken("");
      captchaRef.current?.resetCaptcha();

      // Prefix with uid so the RLS policy (foldername = auth.uid()) is satisfied
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `test-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;
      console.log("[PhotoUploader] uploading to:", filePath);

      const { error } = await supabase.storage
        .from("restaurant-files") // <-- your bucket name
        .upload(filePath, file);

      if (error) throw error;

      setStatus(`Success! Uploaded to: ${filePath}`);

      // Later: get public URL and show preview
      const { data: urlData } = supabase.storage
        .from("restaurant-files")
        .getPublicUrl(filePath);

      console.log("Public URL:", urlData.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus("Error: " + message);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Test Photo Upload</h3>

      {HCAPTCHA_SITE_KEY ? (
        <div className="mb-4">
          <HCaptcha
            ref={captchaRef}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken("")}
            onError={() => setCaptchaToken("")}
          />
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-500">
          hCaptcha site key is missing. Set NEXT_PUBLIC_HCAPTCHA_SITE_KEY.
        </p>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading || !captchaToken}
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {status && (
        <p
          className={`mt-3 ${status.includes("Success") ? "text-green-600" : "text-red-600"}`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
