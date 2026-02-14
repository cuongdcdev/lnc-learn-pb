export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

const API_ENDPOINT = "https://cloud-api.near.ai/v1/chat/completions";

/**
 * Calls the NEAR AI API for chat completions.
 * @param apiKey The user's or demo API key.
 * @param request The completion request parameters.
 * @returns The content of the assistant's response.
 */
export interface CompletionResponse {
  content: string;
  rawRequest: string;
  rawResponse: string;
  chatId: string;
  modelId: string;
}

export async function generateCompletion(apiKey: string, request: CompletionRequest): Promise<CompletionResponse> {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const rawRequest = JSON.stringify(request);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: rawRequest
    });

    // Capture raw text for hashing
    const rawResponse = await response.text();

    if (!response.ok) {
        throw new Error(`NEAR AI API Error: ${response.status} - ${rawResponse}`);
    }

    const data = JSON.parse(rawResponse);
    return {
        content: data.choices[0].message.content,
        rawRequest,
        rawResponse, 
        chatId: data.id,
        modelId: data.model
    };
  } catch (error) {
    console.error("Generate Completion Failed:", error);
    throw error;
  }
}
