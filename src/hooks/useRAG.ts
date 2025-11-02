import { useState, useCallback } from "react";
import {
  performSearch,
  extractSearchQuery,
  formatSearchResults,
  getSearchSettings,
  SearchResponse,
} from "@/lib/searchApi";
import { useToast } from "@/hooks/use-toast";

export const useRAG = () => {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  /**
   * Perform a web search based on user query
   */
  const performWebSearch = useCallback(
    async (userMessage: string): Promise<SearchResponse | null> => {
      const settings = getSearchSettings();

      if (!settings.ragEnabled) {
        return null;
      }

      setIsSearching(true);

      try {
        // Extract search query from user message
        const searchQuery = extractSearchQuery(userMessage);

        if (!searchQuery) {
          console.log("⚠️ Could not extract search query");
          setIsSearching(false);
          return null;
        }

        console.log(`🔍 Performing search: "${searchQuery}"`);

        // Perform search
        const results = await performSearch(
          searchQuery,
          settings.searchEngine,
          settings.maxSearchResults,
          settings.braveApiKey
        );

        console.log(`✅ Found ${results.results.length} results`);
        setSearchResults(results);
        setIsSearching(false);

        return results;
      } catch (error) {
        console.error("❌ Search error:", error);
        toast({
          title: "Search Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to perform web search",
          variant: "destructive",
        });
        setIsSearching(false);
        return null;
      }
    },
    [toast]
  );

  /**
   * Get RAG context to augment AI prompts
   */
  const getRAGContext = useCallback(
    (searchResponse: SearchResponse | null): string => {
      if (!searchResponse || searchResponse.results.length === 0) {
        return "";
      }

      const context = formatSearchResults(searchResponse);
      return `

[Web Search Context - Use this to provide accurate, up-to-date information]
${context}

Please use the above search results to provide accurate and current information in your response. Cite sources when relevant.

---

`;
    },
    []
  );

  /**
   * Clear search results
   */
  const clearSearchResults = useCallback(() => {
    setSearchResults(null);
  }, []);

  /**
   * Check if auto-search is enabled
   */
  const shouldAutoSearch = useCallback((userMessage: string): boolean => {
    const settings = getSearchSettings();

    if (!settings.ragEnabled || !settings.autoSearch) {
      return false;
    }

    // Auto-search for questions and queries
    const questionWords = [
      "what",
      "where",
      "when",
      "who",
      "why",
      "how",
      "is",
      "are",
      "can",
      "could",
      "would",
      "should",
      "do",
      "does",
    ];

    const lowerMessage = userMessage.toLowerCase().trim();

    // Check if message starts with question word or ends with ?
    const startsWithQuestion = questionWords.some((word) =>
      lowerMessage.startsWith(word + " ")
    );
    const endsWithQuestion = lowerMessage.endsWith("?");

    return startsWithQuestion || endsWithQuestion;
  }, []);

  return {
    searchResults,
    isSearching,
    performWebSearch,
    getRAGContext,
    clearSearchResults,
    shouldAutoSearch,
  };
};
