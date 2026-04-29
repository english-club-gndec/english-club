const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../config/settings.json');

router.get('/', (req, res) => {
  try {
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath));
      res.json(settings);
    } else {
      res.json({ recruitmentsActive: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

router.post('/', (req, res) => {
  try {
    const settings = req.body;
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

module.exports = router;
