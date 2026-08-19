import { AskAiParams } from "./AskAiDialog";

export interface AiConfig {
  apiEndpoint?: string;
  keys?: {
    openai?: string;
    google?: string;
    anthropic?: string;
    xai?: string;
    deepseek?: string;
    meta?: string;
    [key: string]: string | undefined;
  };
  fetcher?: typeof fetch;
}

const SYSTEM_PROMPT = `You are a helpful AI writing assistant embedded in a rich text editor.
Please provide your response in HTML format (using <p>, <strong>, <em>, <ul>, etc.) so it can be inserted directly into the document.
Do not wrap your response in markdown code blocks.`;

export function createAskAiHandler(config: AiConfig) {
  return async (params: AskAiParams) => {
    const { prompt, provider, onStream } = params;
    const fetcher = config.fetcher || fetch;
    
    // If user provided an apiEndpoint, route request there
    if (config.apiEndpoint) {
      const res = await fetcher(config.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider }),
      });
      if (!res.ok) throw new Error("Failed to communicate with AI endpoint");
      if (!res.body) throw new Error("No response body from endpoint");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value, { stream: true });
        fullText += chunkStr;
        if (onStream) onStream(chunkStr);
      }
      return fullText.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }

    // Direct Client-Side Implementations
    const model = provider.model;
    
    if (provider.id.startsWith("google") || provider.id.startsWith("gemini")) {
      const key = config.keys?.google;
      if (!key) throw new Error("Google Gemini API key is missing");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key}`;
      const res = await fetcher(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Request:\n${prompt}` }] }],
        }),
      });
      
      if (!res.ok) throw new Error("Failed to communicate with Gemini");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              const chunkText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (chunkText) {
                fullText += chunkText;
                if (onStream) onStream(chunkText);
              }
            } catch (e) {}
          }
        }
      }
      return fullText.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }
    
    if (provider.id.startsWith("openai") || provider.id.startsWith("chatgpt") || provider.id === "xai" || provider.id === "deepseek" || provider.id === "meta") {
      let key = config.keys?.openai;
      let url = "https://api.openai.com/v1/chat/completions";
      
      if (provider.id === "xai") {
        key = config.keys?.xai;
        url = "https://api.x.ai/v1/chat/completions";
      } else if (provider.id === "deepseek") {
        key = config.keys?.deepseek;
        url = "https://api.deepseek.com/chat/completions";
      } else if (provider.id === "meta") {
        key = config.keys?.meta;
        url = "https://api.meta.ai/v1/chat/completions"; // standard OpenAI compatible interface usually
      }

      if (!key) throw new Error(`${provider.label} API key is missing`);

      const res = await fetcher(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          stream: true
        }),
      });

      if (!res.ok) throw new Error(`Failed to communicate with ${provider.label}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              const chunkText = data.choices?.[0]?.delta?.content || "";
              if (chunkText) {
                fullText += chunkText;
                if (onStream) onStream(chunkText);
              }
            } catch (e) {}
          }
        }
      }
      return fullText.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }
    
    if (provider.id.startsWith("anthropic") || provider.id.startsWith("claude")) {
      const key = config.keys?.anthropic;
      if (!key) throw new Error("Anthropic API key is missing");
      const res = await fetcher("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
          stream: true
        }),
      });

      if (!res.ok) throw new Error("Failed to communicate with Anthropic");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "content_block_delta" && data.delta?.text) {
                const chunkText = data.delta.text;
                fullText += chunkText;
                if (onStream) onStream(chunkText);
              }
            } catch (e) {}
          }
        }
      }
      return fullText.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    }

    throw new Error(`Provider ${provider.id} is not implemented natively.`);
  };
}
