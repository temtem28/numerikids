export interface BestPractice {
  title: string;
  description: string;
  example: string;
  category: 'performance' | 'memory' | 'readability' | 'pythonic';
}

export const pythonBestPractices: BestPractice[] = [
  {
    title: "Use List Comprehensions",
    description: "List comprehensions are faster and more Pythonic than traditional for loops for creating lists.",
    example: "# Good: [x**2 for x in range(10)]\n# Avoid: result = []; for x in range(10): result.append(x**2)",
    category: 'performance'
  },
  {
    title: "Use enumerate() Instead of range(len())",
    description: "enumerate() is more readable and Pythonic when you need both index and value.",
    example: "# Good: for i, item in enumerate(items):\n# Avoid: for i in range(len(items)): item = items[i]",
    category: 'pythonic'
  },
  {
    title: "Use join() for String Concatenation",
    description: "join() is much faster than += for concatenating multiple strings.",
    example: "# Good: ''.join(strings)\n# Avoid: result = ''; for s in strings: result += s",
    category: 'performance'
  },
  {
    title: "Use Sets for Membership Testing",
    description: "Sets have O(1) lookup time vs O(n) for lists.",
    example: "# Good: if item in my_set:\n# Avoid: if item in my_list:",
    category: 'performance'
  },
  {
    title: "Use Generators for Large Sequences",
    description: "Generators are memory-efficient for processing large datasets.",
    example: "# Good: (x**2 for x in range(1000000))\n# Memory-heavy: [x**2 for x in range(1000000)]",
    category: 'memory'
  }
];

export const getOptimizationTip = (code: string): BestPractice | null => {
  if (code.includes('range(len(')) {
    return pythonBestPractices[1];
  }
  if (code.match(/\+=.*['"]/) && code.includes('for')) {
    return pythonBestPractices[2];
  }
  if (code.includes('in [') || code.includes('in list')) {
    return pythonBestPractices[3];
  }
  return pythonBestPractices[0];
};
