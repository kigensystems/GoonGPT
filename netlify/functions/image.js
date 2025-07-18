// Netlify Function: Image generation endpoint
// Uses ModelsLab API with Photorealistic-NSFW-flux model

import { imageRateLimiter } from "./utils/rateLimiter.js";
import { validateImageInput } from "./utils/validation.js";

export async function handler(event) {
  console.log("\n========================================");
  console.log("=== IMAGE GENERATION FUNCTION START ===");
  console.log("========================================");
  console.log("Purpose: Generate images using ModelsLab API");
  console.log("Models available: realcartoon-xl-v4 (anime), bigasp-v1 (realism)");

  // Apply rate limiting
  const rateLimitResponse = await imageRateLimiter(event);
  if (rateLimitResponse) {
    console.log("Rate limited response");
    return rateLimitResponse;
  }
  // Check for required environment variables
  if (!process.env.MODELSLAB_API_KEY) {
    console.error("MODELSLAB_API_KEY is not set");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error" }),
    };
  }

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const {
      prompt,
      negative_prompt = "",
      width = 1024,
      height = 1024,
      samples = 1,
      safety_checker = false,
      seed,
      enhance_prompt = true,
      enhance_style,
      style = "anime", // Default to anime style
    } = JSON.parse(event.body);

    console.log("=== IMAGE GENERATION REQUEST ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("\n--- USER INPUT ---");
    console.log("Style selected:", style);
    console.log("User's prompt:", prompt);
    console.log("User's negative prompt:", negative_prompt || "(none provided)");
    console.log("Image dimensions:", `${width}x${height}`);
    console.log("Number of images:", samples);
    console.log("Seed:", seed || "random");
    console.log("Frontend enhance_prompt setting:", enhance_prompt);
    console.log("Frontend enhance_style setting:", enhance_style || "(not provided)");

    // Validate input
    const validation = validateImageInput(prompt, { width, height });
    if (!validation.valid) {
      console.error("Validation failed:", validation.error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: validation.error }),
      };
    }

    console.log("=== MODEL CONFIGURATION ===");
    console.log("Style:", style);
    console.log(
      "Model:",
      style === "anime" ? "realcartoon-xl-v4" : "bigasp-v1"
    );
    console.log("API Key exists:", !!process.env.MODELSLAB_API_KEY);
    console.log("API Key length:", process.env.MODELSLAB_API_KEY?.length);

    let requestBody;

    if (style === "anime") {
      // Anime style configuration
      console.log("\n=== ANIME STYLE SELECTED ===");
      console.log("Using model: realcartoon-xl-v4");
      console.log("User's original prompt:", prompt);
      console.log("No automatic prompt enhancement for anime style");
      
      requestBody = {
        key: process.env.MODELSLAB_API_KEY,
        model_id: "realcartoon-xl-v4",
        prompt: prompt,
        negative_prompt:
          "low quality, bad anatomy, extra limbs, watermark, lowres, blurry, deformed, ugly, mutated hands, poorly drawn face, text, overexposed, underexposed, censored, clothing, monochrome, grayscale",
        width: String(width),
        height: String(height),
        samples: String(samples),
        num_inference_steps: 18,
        safety_checker: "false",
        enhance_prompt: "yes",
        guidance_scale: 6,
        scheduler: "EulerAncestralDiscreteScheduler",
        clip_skip: 1,
        tomesd: "yes",
        seed: seed || null,
      };
    } else {
      // Realism style configuration using bigASP v1
      console.log("\n=== REALISM STYLE SELECTED ===");
      console.log("Using model: bigasp-v1 (optimized for NSFW photorealistic content)");
      console.log("\n--- PROMPT ENHANCEMENT PROCESS ---");
      console.log("User's original prompt:", prompt);
      
      // Automatically enhance prompt with Danbooru tags for optimal quality
      const enhancedPrompt = `score_8_up, photo (medium), 1girl, spread legs, nude, nsfw, ultra realistic, high detail, perfect composition ${prompt}`;
      console.log("\nAutomatic tags added (invisible to user):");
      console.log("  - Quality tags: score_8_up, photo (medium)");
      console.log("  - Content tags: 1girl, spread legs, nude, nsfw");
      console.log("  - Style tags: ultra realistic, high detail, perfect composition");
      console.log("\nFinal enhanced prompt sent to API:", enhancedPrompt);
      
      const enhancedNegative = `score_1, score_2, ${negative_prompt ? negative_prompt + ', ' : ''}ugly, deformed, bad anatomy, extra limbs, blurry, low quality, watermark, signature, child, underage, overexposed, underexposed`;
      console.log("\nNegative prompt enhancement:");
      console.log("  - Added quality filters: score_1, score_2");
      console.log("  - User's negative prompt:", negative_prompt || "(none)");
      console.log("  - Final negative prompt:", enhancedNegative);
      
      requestBody = {
        key: process.env.MODELSLAB_API_KEY,
        model_id: "bigasp-v1",
        prompt: enhancedPrompt,
        negative_prompt: enhancedNegative,
        width: String(width),
        height: String(height),
        samples: String(samples),
        num_inference_steps: 30,
        safety_checker: "false",
        safety_checker_type: "black",
        enhance_prompt: "yes", // ModelsLab's AI will further enhance the prompt
        enhance_style: "nsfw", // Tells ModelsLab to optimize for NSFW content
        guidance_scale: 8.0,
        scheduler: "DPMSolverMultistepScheduler",
        use_karras_sigmas: "yes",
        tomesd: "yes",
        self_attention: "yes",
        upscale: 1,
        clip_skip: 1,
        seed: seed || null,
      };
    }

    console.log("\n=== FULL REQUEST BODY ===");
    console.log("This is what we're sending to ModelsLab API:");
    console.log(JSON.stringify(requestBody, null, 2));
    console.log("\n=== KEY PARAMETERS EXPLAINED ===");
    console.log("- enhance_prompt: When 'yes', ModelsLab's AI will add more details to improve quality");
    console.log("- enhance_style: Tells ModelsLab what style to optimize for (e.g., 'nsfw' for adult content)");
    console.log("- num_inference_steps: More steps = better quality but slower (30-40 is optimal)");
    console.log("- guidance_scale: How closely to follow the prompt (8.0 = strong adherence)");
    console.log("- safety_checker: Set to 'false' to allow NSFW content");

    const startTime = Date.now();
    const response = await fetch(
      "https://modelslab.com/api/v6/images/text2img",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseTime = Date.now() - startTime;
    console.log(`=== API RESPONSE (${responseTime}ms) ===`);
    console.log("Status:", response.status, response.statusText);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ModelsLab API error response:", errorData);
      throw new Error(
        `ModelsLab API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("=== MODELSLAB RESPONSE ===");
    console.log("Status:", result.status);
    console.log("Generation Time:", result.generationTime);
    console.log("ETA:", result.eta);
    console.log("ID:", result.id);
    console.log("Output URLs:", result.output);
    console.log("Meta:", JSON.stringify(result.meta, null, 2));
    console.log("Full response:", JSON.stringify(result, null, 2));

    // Handle different response types
    if (result.status === "error") {
      console.error("API returned error:", result);
      throw new Error(result.message || "Image generation failed");
    }

    // For processing status, return with fetch URL
    if (result.status === "processing") {
      console.log("=== PROCESSING RESPONSE ===");
      console.log("Request ID:", result.id);
      console.log("ETA:", result.eta, "seconds");
      console.log("Fetch URL:", result.fetch_result);
      console.log("Future links:", result.future_links);

      // Don't include the URL yet - it's not ready even if provided
      // The image needs to be fetched later when actually ready
      console.log("\n=== IMAGE NOT READY YET ===");
      console.log("ModelsLab returns URLs immediately but images need time to generate");
      console.log("We'll poll for the image when it's actually ready");
      
      return {
        statusCode: 202, // Accepted
        headers,
        body: JSON.stringify({
          status: "processing",
          eta: Math.round(result.eta) || 2, // Round to whole seconds
          request_id: result.id,
          fetch_result: result.fetch_result,
          // Don't include imageUrl here - it's not ready yet
          message: `Image is being generated. ETA: ${Math.round(result.eta) || 2} seconds`,
        }),
      };
    }

    // For success status, return image URLs
    if (result.status === "success" && result.output) {
      const imageUrl = Array.isArray(result.output)
        ? result.output[0]
        : result.output;

      console.log("=== SUCCESS RESPONSE ===");
      console.log("Image URLs:", result.output);
      console.log("Generation completed in:", result.generationTime, "seconds");

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          imageUrl: imageUrl,
          images: result.output, // Include all images if multiple samples
          prompt: prompt,
          meta: result.meta || {},
        }),
      };
    }

    // Handle unexpected response format
    throw new Error("Unexpected response format from ModelsLab API");
  } catch (error) {
    console.error("Image API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to generate image",
        details: error.message,
      }),
    };
  }
}
