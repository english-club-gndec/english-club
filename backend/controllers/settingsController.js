const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const settingsPath = path.join(__dirname, '../config/settings.json');

// Helper to read local settings as fallback
function readLocalSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath));
    }
  } catch (err) {
    console.error('Error reading local settings:', err.message);
  }
  return { recruitmentsActive: false };
}

// Helper to write local settings as fallback (ignoring EROFS/read-only fs errors)
function writeLocalSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (err) {
    // Ignore read-only file system errors on Vercel/production
    console.warn('Could not write to local settings file (expected in serverless environments):', err.message);
  }
}

const settingsController = {
  getSettings: async (req, res) => {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (!error && data) {
          return res.json({
            recruitmentsActive: data.recruitments_active
          });
        }
      }
      
      // Fallback to local settings file
      const settings = readLocalSettings();
      res.json(settings);
    } catch (error) {
      console.error('Settings read error:', error.message);
      res.status(500).json({ error: 'Failed to read settings' });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const settings = req.body; // { recruitmentsActive: true/false }
      const recruitments_active = settings.recruitmentsActive === true || settings.recruitmentsActive === 'true';

      if (supabase) {
        const { error } = await supabase
          .from('settings')
          .upsert({ id: 1, recruitments_active }, { onConflict: 'id' });
        
        if (error) {
          console.error('Supabase settings update error:', error);
          // If it's not a table-not-found error, throw it so we catch and handle
          if (error.code !== 'PGRST205') {
            throw error;
          }
        } else {
          // Successfully updated DB. Try updating local file (e.g. locally) and return success
          writeLocalSettings({ recruitmentsActive: recruitments_active });
          return res.json({ recruitmentsActive: recruitments_active });
        }
      }

      // Fallback if supabase isn't initialized or table is missing (works locally, might fail on Vercel)
      writeLocalSettings({ recruitmentsActive: recruitments_active });
      res.json({ recruitmentsActive: recruitments_active });
    } catch (error) {
      console.error('Settings save error:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  }
};

module.exports = settingsController;
