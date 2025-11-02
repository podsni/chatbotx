// Search API Integration for DuckDuckGo and Brave Search

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  searchEngine: "duckduckgo" | "brave";
  timestamp: number;
}

/**
 * Search using DuckDuckGo's HTML API
 * Note: This uses a CORS proxy for client-side requests
 */
export async function searchDuckDuckGo(
  query: string,
  maxResults: number = 5
): Promise<SearchResponse> {
  try {
    // DuckDuckGo Instant Answer API
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Process Related Topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (results.length >= maxResults) break;

        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text,
            url: topic.FirstURL,
            snippet: topic.Text,
            source: "DuckDuckGo",
          });
        } else if (topic.Topics && Array.isArray(topic.Topics)) {
          // Handle nested topics
          for (const subTopic of topic.Topics) {
            if (results.length >= maxResults) break;
            if (subTopic.FirstURL && subTopic.Text) {
              results.push({
                title: subTopic.Text.split(" - ")[0] || subTopic.Text,
                url: subTopic.FirstURL,
                snippet: subTopic.Text,
                source: "DuckDuckGo",
              });
            }
          }
        }
      }
    }

    // Add abstract as first result if available
    if (data.Abstract && data.AbstractURL && results.length < maxResults) {
      results.unshift({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.Abstract,
        source: "DuckDuckGo",
      });
    }

    // If no results, try alternative DuckDuckGo lite search
    if (results.length === 0) {
      const liteResults = await searchDuckDuckGoLite(query, maxResults);
      return liteResults;
    }

    return {
      results: results.slice(0, maxResults),
      query,
      searchEngine: "duckduckgo",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("DuckDuckGo search error:", error);
    throw new Error(
      `Failed to search DuckDuckGo: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Alternative DuckDuckGo search using lite HTML interface
 */
async function searchDuckDuckGoLite(
  query: string,
  maxResults: number = 5
): Promise<SearchResponse> {
  try {
    // Use DuckDuckGo lite for better search results
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`DuckDuckGo Lite error: ${response.status}`);
    }

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parse HTML to extract search results
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Find all result rows
    const resultRows = doc.querySelectorAll("tr");

    for (let i = 0; i < resultRows.length && results.length < maxResults; i++) {
      const row = resultRows[i];
      const link = row.querySelector("a.result-link");
      const snippet = row.querySelector(".result-snippet");

      if (link && link.textContent) {
        const href = link.getAttribute("href");
        if (href && !href.includes("duckduckgo.com")) {
          results.push({
            title: link.textContent.trim(),
            url: href,
            snippet: snippet?.textContent?.trim() || "",
            source: "DuckDuckGo",
          });
        }
      }
    }

    return {
      results,
      query,
      searchEngine: "duckduckgo",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("DuckDuckGo Lite search error:", error);
    return {
      results: [],
      query,
      searchEngine: "duckduckgo",
      timestamp: Date.now(),
    };
  }
}

/**
 * Search using Brave Search API
 * Requires API key from https://brave.com/search/api/
 */
export async function searchBrave(
  query: string,
  apiKey: string,
  maxResults: number = 5
): Promise<SearchResponse> {
  if (!apiKey) {
    throw new Error("Brave Search API key is required");
  }

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid Brave API key");
      }
      if (response.status === 429) {
        throw new Error("Brave API rate limit exceeded");
      }
      throw new Error(`Brave API error: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Process web results
    if (data.web && data.web.results && Array.isArray(data.web.results)) {
      for (const result of data.web.results) {
        if (results.length >= maxResults) break;

        results.push({
          title: result.title || "",
          url: result.url || "",
          snippet: result.description || "",
          source: "Brave Search",
        });
      }
    }

    return {
      results,
      query,
      searchEngine: "brave",
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Brave search error:", error);
    throw new Error(
      `Failed to search Brave: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Main search function that routes to the appropriate search engine
 */
export async function performSearch(
  query: string,
  engine: "duckduckgo" | "brave",
  maxResults: number = 5,
  braveApiKey?: string
): Promise<SearchResponse> {
  console.log(`🔍 Searching with ${engine}:`, query);

  if (engine === "brave") {
    if (!braveApiKey) {
      throw new Error("Brave API key is required for Brave Search");
    }
    return await searchBrave(query, braveApiKey, maxResults);
  } else {
    return await searchDuckDuckGo(query, maxResults);
  }
}

/**
 * Extract key search terms from a user query
 */
export function extractSearchQuery(userMessage: string): string {
  // Remove common question words and punctuation
  let query = userMessage
    .toLowerCase()
    .replace(/^(what|where|when|who|why|how|is|are|can|could|would|should|do|does)\s+/gi, "")
    .replace(/[?!.,;]/g, "")
    .trim();

  // Limit to first 10 words for better search results
  const words = query.split(/\s+/);
  if (words.length > 10) {
    query = words.slice(0, 10).join(" ");
  }

  return query;
}

/**
 * Format search results into a context string for RAG
 */
export function formatSearchResults(searchResponse: SearchResponse): string {
  if (searchResponse.results.length === 0) {
    return "No search results found.";
  }

  let context = `Search Results for "${searchResponse.query}" (${searchResponse.searchEngine}):\n\n`;

  searchResponse.results.forEach((result, index) => {
    context += `${index + 1}. ${result.title}\n`;
    context += `   Source: ${result.url}\n`;
    context += `   ${result.snippet}\n\n`;
  });

  return context;
}

/**
 * Get search settings from localStorage
 */
export function getSearchSettings() {
  try {
    const settings = localStorage.getItem("chatbotx-settings");
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        ragEnabled: parsed.ragEnabled ?? false,
        searchEngine: (parsed.searchEngine ?? "duckduckgo") as "duckduckgo" | "brave",
        braveApiKey: parsed.braveApiKey ?? "",
        maxSearchResults: parseInt(parsed.maxSearchResults ?? "5", 10),
        autoSearch: parsed.autoSearch ?? false,
      };
    }
  } catch (error) {
    console.error("Error loading search settings:", error);
  }

  return {
    ragEnabled: false,
    searchEngine: "duckduckgo" as const,
    braveApiKey: "",
    maxSearchResults: 5,
    autoSearch: false,
  };
}
