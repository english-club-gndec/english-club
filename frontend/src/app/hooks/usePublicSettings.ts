import { useEffect, useState } from "react";
import { settingsServices, SettingsData } from "../../services/settingsServices";

const defaultSettings: SettingsData = {
  recruitmentsActive: false,
  resultsActive: false
};

export function usePublicSettings() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const data = await settingsServices.getSettings();
        if (isMounted) {
          setSettings({
            recruitmentsActive: data.recruitmentsActive ?? false,
            resultsActive: data.resultsActive ?? false
          });
        }
      } catch (error) {
        if (isMounted) {
          setSettings(defaultSettings);
        }
        console.error("Failed to fetch public settings:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    settings,
    loading,
    recruitmentsActive: settings.recruitmentsActive,
    resultsActive: settings.resultsActive,
  };
}