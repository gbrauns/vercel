
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

const API_KEY = 'r8_fMq5gAwNPkjB8hnlRZNnWqBMGk9O3OE08B96i';
const VERSION = '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const input = req.body;
  let prompt = `A modern garage door, ${input.width}mm wide and ${input.height}mm high, RAL ${input.color}, ${input.sections} horizontal sections.`;
  if (input.has_door) prompt += ` With a pedestrian door ${input.door_width}x${input.door_height}mm, ${input.door_offset}mm from left.`;
  if (input.has_window) prompt += ` With a window ${input.window_width}x${input.window_height}mm, ${input.window_x}mm from right, ${input.window_y}mm from ground.`;
  prompt += " Technical front view, photorealistic, clean background.";

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: VERSION,
        input: {
          prompt, width: 768, height: 768,
          num_inference_steps: 30,
          guidance_scale: 7.5
        }
      })
    });
    const json = await response.json();
    res.json({ image: json.urls?.get || null, debug: json });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reach Replicate', detail: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy listening on port ${port}`));
