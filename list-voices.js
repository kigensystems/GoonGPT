#!/usr/bin/env node

// List available voices from ModelsLab to find our uploaded voice_id

async function listVoices() {
  const API_KEY = process.env.MODELSLAB_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ MODELSLAB_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🎤 Fetching available voices from ModelsLab...');

  try {
    // Try the voices list endpoint (if it exists)
    const response = await fetch('https://modelslab.com/api/v6/voice/list_voices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('⚠️  List voices endpoint not available or different format');
      console.log('💡 Let\'s try using a common voice_id based on the upload name...');
      
      // Since the upload said "voice_id already exist" with name "asmr_whisper_female"
      // the voice_id is likely just the name we used
      console.log('\n🎯 Based on the error message, your voice_id is likely:');
      console.log('   asmr_whisper_female');
      console.log('\n📋 Try setting this in Netlify:');
      console.log('   ASMR_VOICE_ID=asmr_whisper_female');
      return;
    }

    const result = await response.json();
    console.log('✅ Available voices:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.log('⚠️  Could not fetch voices list');
    console.log('💡 Based on the upload error, your voice_id is likely:');
    console.log('   asmr_whisper_female');
    console.log('\n📋 Try setting this in Netlify:');
    console.log('   ASMR_VOICE_ID=asmr_whisper_female');
  }
}

listVoices();