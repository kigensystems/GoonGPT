#!/usr/bin/env node

// Test to compare voice outputs and debug the issue

async function testVoiceComparison() {
  const API_KEY = process.env.MODELSLAB_API_KEY;
  const VOICE_ID = 'asmrwhisper1752439227657';
  
  if (!API_KEY) {
    console.error('❌ MODELSLAB_API_KEY environment variable is required');
    process.exit(1);
  }

  const testText = "This is a test of the ASMR voice. Can you hear the whisper quality?";

  console.log('🔍 Testing voice outputs to compare...\n');

  // Test 1: Using voice_id
  console.log('1️⃣ Test with voice_id:', VOICE_ID);
  try {
    const response1 = await fetch('https://modelslab.com/api/v6/voice/text_to_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: API_KEY,
        prompt: testText,
        voice_id: VOICE_ID,
        language: 'english',
        speed: 1.0,
      }),
    });

    const result1 = await response1.json();
    console.log('Result:', JSON.stringify(result1, null, 2));
    if (result1.status === 'success') {
      console.log('✅ Audio URL:', result1.output?.[0]);
      console.log('Check meta.voice_id:', result1.meta?.voice_id);
      console.log('Check meta.input_sound_clip:', result1.meta?.input_sound_clip);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Using init_audio directly
  console.log('2️⃣ Test with init_audio URL:');
  try {
    const response2 = await fetch('https://modelslab.com/api/v6/voice/text_to_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: API_KEY,
        prompt: testText,
        init_audio: "https://goongpt.pro/asmr/asmr_combined.wav",
        language: 'english',
        speed: 1.0,
      }),
    });

    const result2 = await response2.json();
    console.log('Result:', JSON.stringify(result2, null, 2));
    if (result2.status === 'success') {
      console.log('✅ Audio URL:', result2.output?.[0]);
      console.log('Check meta.input_sound_clip:', result2.meta?.input_sound_clip);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n---\n');

  // Test 3: Log the exact request body we're sending
  console.log('3️⃣ Exact request body being sent with voice_id:');
  const requestBody = {
    key: API_KEY,
    prompt: testText,
    voice_id: VOICE_ID,
    language: 'english',
    speed: 1.0,
  };
  console.log(JSON.stringify(requestBody, null, 2));

  console.log('\n💡 Compare the audio outputs from both methods to see if they sound different.');
  console.log('The init_audio method should have your custom ASMR voice.');
}

testVoiceComparison();