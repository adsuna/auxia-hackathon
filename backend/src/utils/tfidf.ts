/**
 * TF-IDF (Term Frequency-Inverse Document Frequency) text matching utility
 * with vocabulary management for efficient text similarity calculations
 */

import { cosineSimilarity } from './similarity';

export interface TFIDFDocument {
  id: string;
  text: string;
  vector?: Record<string, number>;
}

export class TFIDFMatcher {
  private vocabulary: Map<string, number>;
  private documentFrequency: Map<string, number>;
  private totalDocuments: number;

  constructor() {
    this.vocabulary = new Map();
    this.documentFrequency = new Map();
    this.totalDocuments = 0;
  }

  /**
   * Tokenize text into words, removing punctuation and converting to lowercase
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(token => token.length > 2) // Filter out very short words
      .filter(token => !this.isStopWord(token)); // Remove common stop words
  }

  /**
   * Simple stop word filter for common English words
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'if', 'then'
    ]);
    return stopWords.has(word);
  }

  /**
   * Build vocabulary from a collection of documents
   */
  buildVocabulary(documents: TFIDFDocument[]): void {
    this.vocabulary.clear();
    this.documentFrequency.clear();
    this.totalDocuments = documents.length;

    // First pass: collect all unique terms and document frequencies
    const allTerms = new Set<string>();
    
    documents.forEach(doc => {
      const tokens = this.tokenize(doc.text);
      const uniqueTokens = new Set(tokens);
      
      uniqueTokens.forEach(token => {
        allTerms.add(token);
        this.documentFrequency.set(
          token, 
          (this.documentFrequency.get(token) || 0) + 1
        );
      });
    });

    // Build vocabulary with indices
    let index = 0;
    allTerms.forEach(term => {
      this.vocabulary.set(term, index++);
    });
  }

  /**
   * Calculate TF-IDF vector for a given text
   */
  vectorize(text: string): Record<string, number> {
    const tokens = this.tokenize(text);
    const termFrequency: Record<string, number> = {};
    const vector: Record<string, number> = {};

    // Calculate term frequency
    tokens.forEach(token => {
      if (this.vocabulary.has(token)) {
        termFrequency[token] = (termFrequency[token] || 0) + 1;
      }
    });

    // Calculate TF-IDF for each term
    for (const term in termFrequency) {
      const tf = termFrequency[term] / tokens.length;
      const df = this.documentFrequency.get(term) || 1;
      const idf = Math.log(this.totalDocuments / df);
      vector[term] = tf * idf;
    }

    return vector;
  }

  /**
   * Calculate text similarity between two strings
   */
  textSimilarity(textA: string, textB: string): number {
    const vectorA = this.vectorize(textA);
    const vectorB = this.vectorize(textB);
    return cosineSimilarity(vectorA, vectorB);
  }

  /**
   * Get vocabulary size
   */
  getVocabularySize(): number {
    return this.vocabulary.size;
  }

  /**
   * Get vocabulary terms (for debugging/inspection)
   */
  getVocabulary(): string[] {
    return Array.from(this.vocabulary.keys()).sort();
  }

  /**
   * Export vocabulary and document frequencies for persistence
   */
  exportModel(): {
    vocabulary: [string, number][];
    documentFrequency: [string, number][];
    totalDocuments: number;
  } {
    return {
      vocabulary: Array.from(this.vocabulary.entries()),
      documentFrequency: Array.from(this.documentFrequency.entries()),
      totalDocuments: this.totalDocuments
    };
  }

  /**
   * Import vocabulary and document frequencies from persistence
   */
  importModel(model: {
    vocabulary: [string, number][];
    documentFrequency: [string, number][];
    totalDocuments: number;
  }): void {
    this.vocabulary = new Map(model.vocabulary);
    this.documentFrequency = new Map(model.documentFrequency);
    this.totalDocuments = model.totalDocuments;
  }
}

// Global TF-IDF matcher instance
export const globalTFIDFMatcher = new TFIDFMatcher();