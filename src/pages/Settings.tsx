
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Settings } from "lucide-react";

interface SettingsRow {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  theme: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, just get one settings row
    supabase.from("settings").select("*").limit(1).single().then(({ data }) => {
      setSettings(data || null);
      setLoading(false);
    });
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Settings />User Settings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : !settings ? (
          <p>No settings found.</p>
        ) : (
          <div className="border rounded p-4 bg-white w-full max-w-lg">
            <div><strong>Notifications:</strong> {settings.notifications_enabled ? "Enabled" : "Disabled"}</div>
            <div><strong>Theme:</strong> {settings.theme}</div>
            <div className="text-xs text-gray-500">user_id: {settings.user_id}</div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
