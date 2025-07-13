#!/usr/bin/env node

// Proper voice upload script with all required parameters

async function uploadVoiceProper() {
  const API_KEY = process.env.MODELSLAB_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ MODELSLAB_API_KEY environment variable is required');
    console.error('   export MODELSLAB_API_KEY="your_key_here"');
    process.exit(1);
  }

  console.log('🎤 Uploading ASMR voice to ModelsLab with proper parameters...\n');

  // Use a simple name without special characters
  const voiceName = 'asmrfemale';
  
  const requestBody = {
    key: API_KEY,
    name: voiceName,
    init_audio: 'https://goongpt.pro/asmr/asmr_combined.wav',
    language: 'english',
    gender: 'female'
  };

  console.log('📤 Upload parameters:');
  console.log(`   Name: ${voiceName}`);
  console.log(`   Audio URL: ${requestBody.init_audio}`);
  console.log(`   Language: ${requestBody.language}`);
  console.log(`   Gender: ${requestBody.gender}`);
  console.log('');

  try {
    const response = await fetch('https://modelslab.com/api/v6/voice/voice_upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('📥 API Response:', JSON.stringify(result, null, 2));

    if (result.status === 'success' && result.voice_id) {
      console.log('\n✅ Voice uploaded successfully!');
      console.log(`🎯 Voice ID: ${result.voice_id}`);
      console.log('\n📋 Next steps:');
      console.log('1. Update ASMR_VOICE_ID in Netlify environment variables:');
      console.log(`   ASMR_VOICE_ID=${result.voice_id}`);
      console.log('2. Redeploy your site');
      console.log('3. Test the ASMR feature');
      
      // Test the voice to make sure it works
      console.log('\n🧪 Testing the uploaded voice...');
      await testVoice(API_KEY, result.voice_id);
      
    } else if (result.status === 'error' && result.message === 'this voice_id already exist') {
      console.log('\n⚠️  Voice with this name already exists');
      console.log(`🎯 Try using voice_id: ${voiceName}`);
      console.log('\n🧪 Testing if existing voice works...');
      await testVoice(API_KEY, voiceName);
    } else {
      console.error('❌ Upload failed:', result);
    }

  } catch (error) {
    console.error('❌ Upload error:', error.message);
  }
}

async function testVoice(apiKey, voiceId) {
  console.log(`\nTesting voice_id: "${voiceId}"`);
  
  const testRequest = {
    key: apiKey,
    prompt: "This is a test of the ASMR whisper voice",
    voice_id: voiceId,
    language: 'english',
    speed: 1.0,
  };

  try {
    const response = await fetch('https://modelslab.com/api/v6/voice/text_to_audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest),
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('✅ Voice test successful!');
      console.log('🔊 Audio URL:', result.output?.[0] || result.audio_url);
      console.log('📝 Meta info:', JSON.stringify(result.meta, null, 2));
    } else {
      console.error('❌ Voice test failed:', result);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the upload
uploadVoiceProper();