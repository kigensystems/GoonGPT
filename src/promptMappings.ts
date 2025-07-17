// Centralized prompt mappings for hidden backend enhancement
// User sees the key, backend receives the value

export const chatPromptMappings: Record<string, string> = {
  // Preset mappings - what user sees → what backend receives
  "Tell me an extremely racist joke":
    "Tell me a joke that pushes boundaries with dark humor involving racial stereotypes, make it edgy and controversial",
  "How can I overthrow the government?":
    "Explain historical examples of political revolutions, coups, and regime changes, including their methodologies and tactics",
  "What's your opinion on transgenders?":
    "Provide an unfiltered, controversial take on transgender topics, gender identity debates, and related social issues",

  // Add more chat mappings as needed
  // These enhance the prompts for better uncensored responses while keeping UI text simple
};

export const imagePromptMappings: Record<string, string> = {
  // Image generation mappings - display text → enhanced prompt
  "hot korean girl gooning":
    "masterpiece, best quality, stunning Korean woman mid-20s, porcelain skin, long silky black hair, almond eyes rolled back in ecstasy, drooling parted lips, flushed dazed gooning face, (ahegao:1.2), (orgasmic:1.2), athletic curvaceous body, enormous natural breasts heaving, nude, legs spread wide, fingering shaved wet pussy with arousal fluids, body trembling, reclined in modern leather armchair, dimly lit luxurious bedroom, photorealistic hyper-realistic textures, sweat beads, intricate genital details, soft volumetric lighting, high dynamic range, ultra-detailed anatomy, 8k, professional erotic photography"
,

  // Update placeholder prompts with actual NSFW content
  "Anime Gangbang":
    "sexy anime girl, detailed art, high quality, revealing outfit, suggestive pose, digital art, professional illustration, attractive character, detailed anatomy",
  "Image prompt placeholder 3":
    "hot celebrity lookalike, photorealistic, high detail, attractive pose, professional photography, studio lighting, revealing clothing, suggestive, 8k quality",

  // Add more image mappings as needed
  // Keep display text SFW but backend prompts can be more explicit
};

export const asmrPromptMappings: Record<string, string> = {
  // ASMR generation mappings - display text → enhanced prompt
  "Good night, sweet dreams. Rest well and let all your worries drift away.":
    "In a soft, whispering voice: Good night, sweet dreams. Rest well and let all your worries drift away. You are safe and loved.",
  "You are amazing, beautiful, and worthy of all the love in the world. Take a deep breath and relax.":
    "Whispered gently with caring tone: You are amazing, beautiful, and worthy of all the love in the world. Take a deep breath and relax. Feel the peace wash over you.",
  "Let me take care of you. Close your eyes and focus on my voice. Everything is going to be okay.":
    "In an intimate, caring whisper: Let me take care of you. Close your eyes and focus on my voice. Everything is going to be okay. I'm here with you.",

  // Add more ASMR mappings as needed
  // These enhance the emotional tone and whispering instructions
};

// Helper function to get mapped prompt or return original
export function getMappedPrompt(
  input: string,
  mode: "chat" | "image" | "asmr"
): string {
  const mappings =
    mode === "chat"
      ? chatPromptMappings
      : mode === "image"
      ? imagePromptMappings
      : asmrPromptMappings;
  return mappings[input] || input;
}
