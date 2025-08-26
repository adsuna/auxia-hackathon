/**
 * Utility functions for calculating similarity between different data types
 */

/**
 * Calculate Jaccard similarity between two arrays of strings (skills)
 * Jaccard similarity = |intersection| / |union|
 * @param setA First set of skills
 * @param setB Second set of skills
 * @returns Similarity score between 0 and 1
 */
export function jaccardSimilarity(setA: string[], setB: string[]): number {
  if (setA.length === 0 && setB.length === 0) {
    return 1; // Both empty sets are identical
  }
  
  if (setA.length === 0 || setB.length === 0) {
    return 0; // One empty, one non-empty
  }

  // Convert to lowercase for case-insensitive comparison
  const normalizedA = new Set(setA.map(skill => skill.toLowerCase().trim()));
  const normalizedB = new Set(setB.map(skill => skill.toLowerCase().trim()));

  // Calculate intersection
  const intersection = new Set([...normalizedA].filter(x => normalizedB.has(x)));
  
  // Calculate union
  const union = new Set([...normalizedA, ...normalizedB]);

  return intersection.size / union.size;
}

/**
 * Calculate cosine similarity between two TF-IDF vectors
 * @param vecA First vector (word -> frequency map)
 * @param vecB Second vector (word -> frequency map)
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(
  vecA: Record<string, number>, 
  vecB: Record<string, number>
): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Calculate dot product and norm for vecA
  for (const key in vecA) {
    if (vecB[key]) {
      dotProduct += vecA[key] * vecB[key];
    }
    normA += vecA[key] * vecA[key];
  }

  // Calculate norm for vecB
  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  // Avoid division by zero
  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}