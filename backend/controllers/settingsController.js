const supabase = require('../config/supabase');

const defaultSettings = {
  recruitmentsActive: false,
  resultsActive: false,
  isRecruitmentStarted: false
};

function normalizeSettings(settings = {}) {
  return {
    recruitmentsActive: settings.recruitmentsActive === true || settings.recruitmentsActive === 'true',
    resultsActive: settings.resultsActive === true || settings.resultsActive === 'true',
    isRecruitmentStarted: settings.isRecruitmentStarted === true || settings.isRecruitmentStarted === 'true'
  };
}

function mergeSettings(primary = {}, fallback = defaultSettings) {
  return {
    recruitmentsActive: primary.recruitmentsActive !== undefined ? primary.recruitmentsActive === true : fallback.recruitmentsActive,
    resultsActive: primary.resultsActive !== undefined ? primary.resultsActive === true : fallback.resultsActive,
    isRecruitmentStarted: primary.isRecruitmentStarted !== undefined ? primary.isRecruitmentStarted === true : fallback.isRecruitmentStarted
  };
}

const settingsController = {
  getSettings: async (req, res) => {
    try {
      if (!supabase) {
        return res.status(503).json({ error: 'Settings database is unavailable' });
      }

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return res.json(defaultSettings);
      }

      return res.json(mergeSettings({
        recruitmentsActive: data.recruitments_active,
        resultsActive: data.results_active,
        isRecruitmentStarted: data.recruitment_started
      }));
    } catch (error) {
      console.error('Settings read error:', error.message || error);
      res.status(500).json({ error: error.message || 'Failed to read settings from database' });
    }
  },

  updateSettings: async (req, res) => {
    try {
      if (!supabase) {
        return res.status(503).json({ error: 'Settings database is unavailable' });
      }

      const currentSettings = await settingsController.getSettingsSnapshot();
      const incomingSettings = normalizeSettings(req.body || {});
      const mergedSettings = {
        recruitmentsActive: req.body.recruitmentsActive !== undefined ? incomingSettings.recruitmentsActive : currentSettings.recruitmentsActive,
        resultsActive: req.body.resultsActive !== undefined ? incomingSettings.resultsActive : currentSettings.resultsActive,
        isRecruitmentStarted: req.body.isRecruitmentStarted !== undefined ? incomingSettings.isRecruitmentStarted : currentSettings.isRecruitmentStarted
      };
      const recruitments_active = mergedSettings.recruitmentsActive;
      const results_active = mergedSettings.resultsActive;
      const recruitment_started = mergedSettings.isRecruitmentStarted;

      const { data, error } = await supabase
        .from('settings')
        .upsert({ id: 1, recruitments_active, results_active, recruitment_started }, { onConflict: 'id' })
        .select();

      if (error) throw error;

      const record = (data && data[0]) ? data[0] : { recruitments_active, results_active, recruitment_started };

      return res.json(mergeSettings({
        recruitmentsActive: record.recruitments_active,
        resultsActive: record.results_active,
        isRecruitmentStarted: record.recruitment_started
      }));
    } catch (error) {
      console.error('Settings save error:', error.message || error);
      res.status(500).json({ error: error.message || 'Failed to save settings to database' });
    }
  },

  getSettingsSnapshot: async () => {
    if (!supabase) {
      return defaultSettings;
    }

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error || !data) {
        return defaultSettings;
      }

      return mergeSettings({
        recruitmentsActive: data.recruitments_active,
        resultsActive: data.results_active,
        isRecruitmentStarted: data.recruitment_started
      });
    } catch (err) {
      return defaultSettings;
    }
  }
};

module.exports = settingsController;
