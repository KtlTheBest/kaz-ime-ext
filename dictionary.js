// Phonetic mapping rules (Russian to Kazakh)
const PHONETIC_MAPPING = {
  'а': ['а', 'ә'],
  'е': ['е', 'ә'],
  'и': ['и', 'і'],
  'о': ['о', 'ө'],
  'у': ['у', 'ү', 'ұ'],
  'ы': ['ы', 'і'],
  'э': ['э', 'ә'],
  'к': ['к', 'қ'],
  'г': ['г', 'ғ'],
  'н': ['н', 'ң'],
  'х': ['х', 'һ'],
  'щ': ['щ', 'ш'],
  'я': ['я', 'ья'],
  'ю': ['ю', 'ью'],
  'ё': ['ё', 'ьо']
};

// Function to generate all possible combinations using phonetic substitutions
function generateCandidates(russianInput) {
  const input = russianInput.toLowerCase();
  const candidates = new Set();
  
  // Generate all possible combinations
  const combinations = generateCombinations(input);
  
  // Filter only valid Kazakh words
  combinations.forEach(combination => {
    if (isValidKazakhWord(combination)) {
      candidates.add(combination);
    }
  });
  
  return Array.from(candidates);
}

// Recursive function to generate all possible character combinations
function generateCombinations(input, index = 0, current = '') {
  if (index === input.length) {
    return [current];
  }
  
  const char = input[index];
  const results = [];
  
  // If the character has phonetic mappings, try all substitutions
  if (PHONETIC_MAPPING[char]) {
    for (const substitution of PHONETIC_MAPPING[char]) {
      const newCombinations = generateCombinations(input, index + 1, current + substitution);
      results.push(...newCombinations);
    }
  } else {
    // Keep the original character if no mapping exists
    const newCombinations = generateCombinations(input, index + 1, current + char);
    results.push(...newCombinations);
  }
  
  return results;
}

// Function to adjust case of suggestion to match original input
function adjustCase(suggestion, originalInput) {
  if (originalInput.length === 0) return suggestion;
  
  // If first character of original input is uppercase, capitalize the suggestion
  if (originalInput[0] === originalInput[0].toUpperCase()) {
    return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
  }
  
  return suggestion;
}

// Function to find the best candidate with case preservation
function findBestCandidate(russianInput) {
  const candidates = generateCandidates(russianInput);
  
  if (candidates.length === 0) {
    return null;
  }
  
  // For now, return the first candidate, but you could implement ranking here
  const bestCandidate = candidates[0];
  return adjustCase(bestCandidate, russianInput);
}
