export interface QuestionEvaluationItem {
  questionNumber: number;
  question: string;
  studentAnswer: string;
  score: number;
  strengths: string;
  deficiencies: string;
  recommendedFix: string;
}

export interface InterviewEvaluationResult {
  score: number;
  grade: string;
  roundName: string;
  aptitudeScore: number;
  technicalDepth: number;
  problemSolving: number;
  communication: number;
  behavioralFit: number;
  highRiskTopics: string[];
  strengths: string[];
  evaluations: QuestionEvaluationItem[];
  recommendedResources: {
    title: string;
    category: "Placement" | "Academics";
    url: string;
    platform: "YouTube" | "LeetCode" | "GeeksforGeeks" | "Documentation";
    estimatedTime: string;
    description: string;
  }[];
  overallSummary: string;
  isPlacementChallengeEligible: boolean;
}

// Question concept dictionaries for rigorous scoring
interface ConceptRule {
  targetKeywords: string[];
  numericalAnswers?: string[];
  minimumWords: number;
  topicName: string;
}

const QUESTION_CONCEPTS: Record<string, ConceptRule> = {
  // Technical & DSA Round
  "LRU Cache": {
    targetKeywords: ["doubly linked list", "hash map", "hash table", "hashmap", "o(1)", "evict", "head", "tail", "least recently used", "pointer"],
    minimumWords: 8,
    topicName: "LRU Cache Architecture (DLL + HashMap)",
  },
  "palindromic substring": {
    targetKeywords: ["center", "expand", "o(n^2)", "manacher", "radius", "palindrome", "odd", "even", "dynamic programming"],
    minimumWords: 8,
    topicName: "Longest Palindrome Verification & Center Expansion",
  },
  "Binary Search Tree": {
    targetKeywords: ["inorder", "sorted", "min", "max", "range", "lower bound", "upper bound", "recursion", "left", "right"],
    minimumWords: 8,
    topicName: "BST Invariant & Range Constraint Validation",
  },
  "QuickSort, MergeSort": {
    targetKeywords: ["o(n log n)", "worst case", "pivot", "o(n^2)", "space complexity", "in-place", "stable", "merge"],
    minimumWords: 8,
    topicName: "Sorting Complexity & Space/Time Trade-offs",
  },
  "Dijkstra": {
    targetKeywords: ["greedy", "priority queue", "min-heap", "min heap", "negative", "cycle", "visited", "relaxation", "shortest path"],
    minimumWords: 8,
    topicName: "Dijkstra Algorithm & Non-Negative Edge Constraints",
  },
  "0/1 Knapsack": {
    targetKeywords: ["dynamic programming", "dp", "memoization", "tabulation", "1d", "space optimization", "weight", "value", "o(w)"],
    minimumWords: 8,
    topicName: "0/1 Knapsack Dynamic Programming & Space Reduction",
  },

  // Aptitude & Problem Solving
  "platform": {
    targetKeywords: ["150", "300", "15 m/s", "54 * 5/18", "speed", "distance", "train"],
    numericalAnswers: ["150", "150m", "150 meters"],
    minimumWords: 4,
    topicName: "Train Speed & Platform Relative Distance",
  },
  "CAMPUS": {
    targetKeywords: ["240", "5!", "2!", "120", "vowels", "factorial", "permutation"],
    numericalAnswers: ["240", "240 ways"],
    minimumWords: 4,
    topicName: "Permutations with Vowel Grouping Invariant",
  },
  "Two pipes": {
    targetKeywords: ["12", "1/20", "1/30", "5/60", "1/12", "minutes", "rate", "together"],
    numericalAnswers: ["12", "12 min", "12 minutes"],
    minimumWords: 4,
    topicName: "Combined Work & Pipe Flow Rates",
  },
  "probability": {
    targetKeywords: ["98/125", "27/125", "1 -", "3/5", "complement", "at least once"],
    numericalAnswers: ["98/125", "0.784"],
    minimumWords: 4,
    topicName: "Complementary Probability Calculation",
  },
  "profit": {
    targetKeywords: ["12.5", "12.5%", "112.5", "cost price", "marked price", "discount"],
    numericalAnswers: ["12.5", "12.5%"],
    minimumWords: 4,
    topicName: "Commercial Arithmetic (Markup & Discount Margin)",
  },
  "sequence": {
    targetKeywords: ["224", "double", "multiply by 2", "geometric", "ratio", "* 2"],
    numericalAnswers: ["224"],
    minimumWords: 4,
    topicName: "Geometric Number Series Progression",
  },

  // System Design
  "URL Shortener": {
    targetKeywords: ["base62", "hashing", "md5", "distributed counter", "zookeeper", "cache", "redis", "collision", "redirect", "301", "302"],
    minimumWords: 8,
    topicName: "High-Throughput Distributed Hash Encoding",
  },
  "Optimistic Locking": {
    targetKeywords: ["version", "select for update", "pessimistic", "contention", "row lock", "deadlock", "acid", "mvcc"],
    minimumWords: 8,
    topicName: "Database Concurrency & Isolation Locks",
  },
  "rate limiting": {
    targetKeywords: ["sliding window", "redis", "token bucket", "leaky bucket", "ip", "header", "distributed", "sorted set", "zadd"],
    minimumWords: 8,
    topicName: "Distributed Rate Limiting with Redis Primitives",
  },
  "CAP Theorem": {
    targetKeywords: ["consistency", "availability", "partition", "tolerance", "eventual consistency", "quorum", "dynamo", "cassandra", "network partition"],
    minimumWords: 8,
    topicName: "Distributed Consensus & CAP Trade-Off Analysis",
  },
  "Kafka": {
    targetKeywords: ["idempotent", "consumer group", "offset", "at-least-once", "deduplication", "ack", "partition", "broker"],
    minimumWords: 8,
    topicName: "Event-Driven Message Delivery & Deduplication",
  },
  "sharding": {
    targetKeywords: ["consistent hashing", "virtual nodes", "rehash", "hotspot", "shard key", "ring", "partition"],
    minimumWords: 8,
    topicName: "Database Horizontal Partitioning & Consistent Hashing",
  },
};

const IRRELEVANT_PATTERNS = [
  "idk", "i don't know", "i dont know", "no idea", "nothing", "skip", "pass", "na",
  "asdf", "qwerty", "hello", "hi", "hey", "cricket", "food", "movie", "good", "bad", "whatever", "none"
];

export function evaluateStudentInterviewInstant(
  track: string,
  round: string,
  qaPairs: { question: string; answer: string }[]
): InterviewEvaluationResult {
  const evaluations: QuestionEvaluationItem[] = [];
  const highRiskTopics: string[] = [];
  const confirmedStrengths: string[] = [];

  let totalScore = 0;

  qaPairs.forEach((qa, idx) => {
    const rawAnswer = (qa.answer || "").trim();
    const answerLower = rawAnswer.toLowerCase();
    const words = rawAnswer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Find applicable concept rule
    let rule: ConceptRule | undefined;
    for (const [key, r] of Object.entries(QUESTION_CONCEPTS)) {
      if (qa.question.toLowerCase().includes(key.toLowerCase())) {
        rule = r;
        break;
      }
    }

    let qScore = 0;
    let strengths = "";
    let deficiencies = "";
    let fix = "";

    // CHECK 1: Is answer empty, gibberish, or irrelevant?
    const isIrrelevant =
      wordCount < 4 ||
      IRRELEVANT_PATTERNS.some((p) => answerLower === p || (wordCount < 6 && answerLower.includes(p)));

    if (isIrrelevant) {
      qScore = 0;
      deficiencies = "Irrelevant or insufficient response provided. No conceptual understanding demonstrated.";
      fix = "Review the fundamental theory for this topic and answer with specific definitions and mechanisms.";
      highRiskTopics.push(rule ? rule.topicName : `Question ${idx + 1} Concepts`);
    } else if (rule) {
      // Check for numerical match if aptitude question
      const hasNumericalMatch = rule.numericalAnswers?.some((num) =>
        answerLower.includes(num.toLowerCase())
      );

      // Check keywords match
      const matchedKeywords = rule.targetKeywords.filter((kw) =>
        answerLower.includes(kw.toLowerCase())
      );

      if (hasNumericalMatch) {
        qScore = 95;
        strengths = `Correct numerical solution identified with supporting reasoning (${matchedKeywords.slice(0, 2).join(", ") || "accurate calculation"}).`;
        confirmedStrengths.push(rule.topicName);
      } else if (matchedKeywords.length >= 3 && wordCount >= rule.minimumWords) {
        qScore = Math.min(95, 75 + matchedKeywords.length * 5);
        strengths = `Accurate explanation detailing core mechanisms (${matchedKeywords.slice(0, 3).join(", ")}).`;
        confirmedStrengths.push(rule.topicName);
      } else if (matchedKeywords.length >= 1 && wordCount >= 6) {
        qScore = 55;
        strengths = `Partial conceptual overlap (${matchedKeywords[0]}).`;
        deficiencies = `Missing deeper system mechanisms and edge case complexity trade-offs.`;
        fix = `Elaborate on internal data structures, Big-O metrics, and boundary failure modes.`;
        highRiskTopics.push(rule.topicName);
      } else {
        // Did not match the technical concepts of the question
        qScore = 15;
        deficiencies = `Answer does not address the required technical concepts (${rule.targetKeywords.slice(0, 3).join(", ")}).`;
        fix = `Study this topic thoroughly. Explain the internal working and provide a concrete example.`;
        highRiskTopics.push(rule.topicName);
      }
    } else {
      // General behavioral / soft skills questions
      if (wordCount >= 25) {
        qScore = 85;
        strengths = "Structured professional communication with situational context and clear resolution.";
        confirmedStrengths.push("Professional Communication & Conflict Resolution");
      } else if (wordCount >= 10) {
        qScore = 60;
        strengths = "Brief situational overview presented.";
        deficiencies = "Needs concrete metrics, personal ownership, and structured STAR (Situation-Task-Action-Result) format.";
        fix = "Structure response using the STAR framework.";
      } else {
        qScore = 10;
        deficiencies = "Superficial reply lacking situational depth or professional ownership.";
        fix = "Prepare structured behavioral anecdotes demonstrating leadership and collaboration.";
      }
    }

    totalScore += qScore;

    evaluations.push({
      questionNumber: idx + 1,
      question: qa.question,
      studentAnswer: rawAnswer || "(No answer recorded)",
      score: qScore,
      strengths: strengths || (qScore > 0 ? "Attempted under timed proctored conditions." : "None demonstrated."),
      deficiencies: deficiencies || "No major deficiencies detected.",
      recommendedFix: fix || "Continue practicing similar medium/hard interview problems.",
    });
  });

  const count = qaPairs.length || 1;
  const overallScore = Math.round(totalScore / count);

  // Exact metrics derived from answer scores
  const technicalDepth = Math.round(overallScore * 0.96);
  const problemSolving = Math.round(overallScore * 0.98);
  const aptitudeScore = Math.round(overallScore * 0.94);
  const communication = Math.round(Math.min(95, Math.max(15, overallScore * 0.9 + 5)));
  const behavioralFit = Math.round(Math.min(95, Math.max(20, overallScore * 0.92 + 8)));

  const grade =
    overallScore >= 90 ? "A+" :
    overallScore >= 80 ? "A" :
    overallScore >= 70 ? "B+" :
    overallScore >= 60 ? "B" :
    overallScore >= 50 ? "C" : "Needs Remediation";

  const isPlacementChallengeEligible = overallScore >= 80;

  const defaultResources = [
    {
      title: "NeetCode: Dynamic Programming & 1D/2D Roadmap",
      category: "Placement" as const,
      url: "https://www.youtube.com/watch?v=oBt53YbR9Kk",
      platform: "YouTube" as const,
      estimatedTime: "45 mins",
      description: "Visual step-by-step masterclass on optimal substructure and space reduction.",
    },
    {
      title: "Gaurav Sen: System Design Distributed Concurrency & Locks",
      category: "Placement" as const,
      url: "https://www.youtube.com/watch?v=iuqZvajTO44",
      platform: "YouTube" as const,
      estimatedTime: "35 mins",
      description: "Comprehensive guide to mutex locks, race hazards, and distributed caching.",
    },
    {
      title: "Abdul Bari: Graph Algorithms & Dijkstra Mechanics",
      category: "Placement" as const,
      url: "https://www.youtube.com/watch?v=XB4MIexjvY0",
      platform: "YouTube" as const,
      estimatedTime: "40 mins",
      description: "Mathematical proof of Dijkstra greedy relaxation and priority queue traversal.",
    },
    {
      title: "LeetCode 75 Curated Placement Study Plan",
      category: "Placement" as const,
      url: "https://leetcode.com/studyplan/leetcode-75/",
      platform: "LeetCode" as const,
      estimatedTime: "Self-Paced",
      description: "Top 75 essential interview questions asked in Tier-1 product recruitment drives.",
    },
  ];

  const uniqueRisks = Array.from(new Set(highRiskTopics)).slice(0, 3);
  if (uniqueRisks.length === 0) {
    uniqueRisks.push("Concurrency Thread Safety Edge Cases", "Extreme Scale Memory Profiling");
  }

  const uniqueStrengths = Array.from(new Set(confirmedStrengths)).slice(0, 3);
  if (uniqueStrengths.length === 0) {
    uniqueStrengths.push("Active participation under timed proctoring");
  }

  return {
    score: overallScore,
    grade,
    roundName: round,
    aptitudeScore,
    technicalDepth,
    problemSolving,
    communication,
    behavioralFit,
    highRiskTopics: uniqueRisks,
    strengths: uniqueStrengths,
    evaluations,
    recommendedResources: defaultResources,
    isPlacementChallengeEligible,
    overallSummary:
      overallScore >= 80
        ? `Outstanding performance. Candidate achieved an evaluated score of ${overallScore}/100 across ${count} questions in ${round}. Answers demonstrated rigorous technical accuracy and appropriate algorithmic depth.`
        : overallScore >= 50
        ? `Moderate performance. Candidate achieved ${overallScore}/100 in ${round}. Several questions lacked precise terminology or mechanisms. Address identified gaps before campus recruitment drives.`
        : `Unsatisfactory performance. Candidate scored ${overallScore}/100 in ${round}. Multiple answers were either irrelevant, skipped, or conceptually incorrect. Intensive remedial practice required.`,
  };
}
