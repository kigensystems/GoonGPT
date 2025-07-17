// Netlify Function: Image generation endpoint
// Uses ModelsLab API with Photorealistic-NSFW-flux model

import { imageRateLimiter } from "./utils/rateLimiter.js";
import { validateImageInput } from "./utils/validation.js";

export async function handler(event) {
  console.log("=== IMAGE FUNCTION START ===");
  console.log(
    "Event received:",
    JSON.stringify(
      {
        httpMethod: event.httpMethod,
        path: event.path,
        headers: event.headers,
        bodyLength: event.body?.length,
      },
      null,
      2
    )
  );

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
    } = JSON.parse(event.body);

    console.log("=== IMAGE GENERATION REQUEST ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log(
      "Request body:",
      JSON.stringify(
        {
          prompt: prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""),
          negative_prompt: negative_prompt
            ? negative_prompt.substring(0, 50) + "..."
            : "none",
          width,
          height,
          samples,
          seed: seed || "random",
          enhance_prompt,
        },
        null,
        2
      )
    );

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
    console.log("Model: pyros-nsfw-sdxl");
    console.log(
      "LoRAs: add_detail (0.6), orgasm_face_for_pyros_nsfw_sdxl (0.8)"
    );
    console.log("Inference steps: 30");
    console.log("Guidance scale: 6.0");
    console.log("Scheduler: UniPCMultistepScheduler");
    console.log("API Key exists:", !!process.env.MODELSLAB_API_KEY);
    console.log("API Key length:", process.env.MODELSLAB_API_KEY?.length);

  
    const requestBody = {
      key: process.env.MODELSLAB_API_KEY,
      model_id: "pyros-nsfw-sdxl",
      prompt: prompt,
      negative_prompt:
        "blurry, deformed, ugly, mutated hands, extra limbs, poorly drawn face, bad anatomy, watermark, text, low resolution, overexposed, underexposed, censored, clothing, cartoonish, anime style, bored expression, closed eyes, pain, watermark",
      width: String(width),
      height: String(height),
      samples: String(samples),
      negative_prompt:
        "bad quality, worst quality, blurry, deformed, ugly, mutated hands, extra limbs, poorly drawn face, bad anatomy, watermark, text, low resolution, overexposed, underexposed, censored, clothing, cartoonish, anime style, bored expression, closed eyes, pain",
      lora_model: "add_detail,ahegao_faces_sdxl",
      lora_strength: "0.7,0.8",

      num_inference_steps: 20,
      safety_checker: "no",
      enhance_prompt: "yes",
      guidance_scale: 5.5,
      scheduler: "Euler a",
      clip_skip: 2,
      use_karras_sigmas: "yes",
      tomesd: "yes",
      seed: null,
    };

    console.log("=== FULL REQUEST BODY ===");
    console.log(JSON.stringify(requestBody, null, 2));

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

      return {
        statusCode: 202, // Accepted
        headers,
        body: JSON.stringify({
          status: "processing",
          eta: result.eta,
          request_id: result.id,
          fetch_result: result.fetch_result,
          message: `Image is being generated. ETA: ${result.eta} seconds`,
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
