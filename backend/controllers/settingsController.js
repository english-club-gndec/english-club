const supabase = require('../config/supabase');

const defaultSettings = {
  recruitmentsActive: false,
  resultsActive: false
};

function normalizeSettings(settings = {}) {
  return {
    recruitmentsActive: settings.recruitmentsActive === true || settings.recruitmentsActive === 'true',
    resultsActive: settings.resultsActive === true || settings.resultsActive === 'true'
  };
}

function mergeSettings(primary = {}, fallback = defaultSettings) {
  return {
    recruitmentsActive: primary.recruitmentsActive !== undefined ? primary.recruitmentsActive === true : fallback.recruitmentsActive,
    resultsActive: primary.resultsActive !== undefined ? primary.resultsActive === true : fallback.resultsActive
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
        .single();

      if (error || !data) {
        throw error || new Error('Settings record is missing');
      }

      return res.json(mergeSettings({
        recruitmentsActive: data.recruitments_active,
        resultsActive: data.results_active
      }));
    } catch (error) {
      console.error('Settings read error:', error.message);
      res.status(503).json({ error: 'Failed to read settings from database' });
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
        resultsActive: req.body.resultsActive !== undefined ? incomingSettings.resultsActive : currentSettings.resultsActive
      };
      const recruitments_active = mergedSettings.recruitmentsActive;
      const results_active = mergedSettings.resultsActive;

      const { data, error } = await supabase
        .from('settings')
        .upsert({ id: 1, recruitments_active, results_active }, { onConflict: 'id' })
        .select()
        .single();

      if (error || !data) {
        throw error || new Error('Settings database update did not return a record');
      }

      return res.json(mergeSettings({
        recruitmentsActive: data.recruitments_active,
        resultsActive: data.results_active
      }));
    } catch (error) {
      console.error('Settings save error:', error);
      res.status(503).json({ error: 'Failed to save settings to database' });
    }
  },

  getSettingsSnapshot: async () => {
    if (!supabase) {
      throw new Error('Settings database is unavailable');
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      throw error || new Error('Settings record is missing');
    }

    return mergeSettings({
      recruitmentsActive: data.recruitments_active,
      resultsActive: data.results_active
    });
  }
};

module.exports = settingsController;
