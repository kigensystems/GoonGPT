#!/usr/bin/env node

// One-time utility script to upload ASMR voice to ModelsLab
// Run this once to get the voice_id, then add it to your environment variables

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadVoice() {
  const API_KEY = process.env.MODELSLAB_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ MODELSLAB_API_KEY environment variable is required');
    process.exit(1);
  }

  // Get the full URL to the hosted audio file
  const DOMAIN = process.argv[2] || process.env.NETLIFY_URL;
  
  if (!DOMAIN) {
    console.error('❌ Please provide your Netlify domain:');
    console.error('   node upload-voice.js https://your-domain.netlify.app');
    console.error('   OR set NETLIFY_URL environment variable');
    process.exit(1);
  }
  
  const audioUrl = `${DOMAIN}/asmr/asmr_combined.wav`;
  
  console.log('🎤 Uploading ASMR voice to ModelsLab...');
  console.log('📄 Audio URL:', audioUrl);

  const requestBody = {
    key: API_KEY,
    name: 'asmr_whisper_female',
    init_audio: audioUrl,
    language: 'english',
    gender: 'female'
  };

  try {
    const response = await fetch('https://modelslab.com/api/v6/voice/voice_upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Upload failed:', response.status, errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Voice upload response:', JSON.stringify(result, null, 2));

    if (result.status === 'success' && result.voice_id) {
      console.log('\n🎉 SUCCESS! Voice uploaded successfully');
      console.log('📝 Voice ID:', result.voice_id);
      console.log('\n📋 Next steps:');
      console.log('1. Add this to your Netlify environment variables:');
      console.log(`   ASMR_VOICE_ID=${result.voice_id}`);
      console.log('2. Redeploy your site');
      console.log('3. Test the ASMR feature');
    } else {
      console.error('❌ Unexpected response format:', result);
    }

  } catch (error) {
    console.error('❌ Upload error:', error.message);
  }
}

// Instructions for manual upload if needed
console.log('🔧 ASMR Voice Upload Utility\n');
console.log('This script uploads your custom ASMR voice to ModelsLab.');
console.log('Make sure you have MODELSLAB_API_KEY in your environment.\n');

// Check if audio file exists locally (for reference)
const localAudioPath = path.join(__dirname, 'public', 'asmr', 'asmr_combined.wav');
if (fs.existsSync(localAudioPath)) {
  console.log('✅ Found local audio file:', localAudioPath);
} else {
  console.log('⚠️  Local audio file not found:', localAudioPath);
}

console.log('\n🚀 Starting upload...\n');
uploadVoice();