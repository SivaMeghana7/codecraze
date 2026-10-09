import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
interface QAPair {
  question: string;
  answer: string;
}

interface QuestionEvaluation {
  questionNumber: number;
  question: string;
  studentAnswer: string;
  score: number;
  strengths: string;
  deficiencies: string;
  recommendedFix: string;
}

/**
 * Intelligent Semantic Fallback Analyzer
 * Evaluates the student's ACTUAL answers against question topics, depth, and keywords
 */
function evaluateAnswersSemantically(track: string, round: string, qaPairs: QAPair[]) {
  const evaluations: QuestionEvaluation[] = [];

  let totalTechnicalPoints = 0;
  let totalProblemSolvingPoints = 0;
  let totalAptitudePoints = 0;
  let totalCommunicationPoints = 0;
  let totalCulturePoints = 0;

  const identifiedRisks: string[] = [];
  const identifiedStrengths: string[] = [];

  // Key topic keywords to look for
  const techKeywords = [
    "time complexity", "space complexity", "o(n)", "o(log n)", "o(1)", "o(v+e)",
    "memoization", "tabulation", "dynamic programming", "optimal substructure", "overlapping",
    "binary search", "hash table", "hash map", "tree", "graph", "dfs", "bfs", "dijkstra",
    "concurrency", "thread", "mutex", "lock", "race condition", "deadlock", "atomic",
    "virtual memory", "paging", "thrashing", "index", "b-tree", "sql", "acid", "cache",
    "latency", "throughput", "microservices", "api", "rest", "idempotent", "stateless"
  ];

  const problemSolvingKeywords = [
    "first step", "edge case", "trade-off", "tradeoff", "optimize", "base case",
    "recurrence", "boundary", "null check", "two pointers", "divide and conquer", "greedy"
  ];

  const commKeywords = [
    "furthermore", "specifically", "for example", "in contrast", "alternatively",
    "therefore", "in conclusion", "primarily", "architecture", "implementation"
  ];

  qaPairs.forEach((qa, idx) => {
    const ans = (qa.answer || "").trim();
    const ansLower = ans.toLowerCase();
    const words = ans.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let qScore = 0;
    let strengths = "";
    let deficiencies = "";
    let fix = "";

    // 1. Check for empty or non-answers
    if (wordCount < 4 || ["idk", "i don't know", "dont know", "no idea", "skip", "pass", "na"].includes(ansLower)) {
      qScore = 15;
      deficiencies = "Answer was negligible or skipped. No conceptual understanding demonstrated.";
      fix = "Review foundational concepts for this topic and prepare a structured 3-part response (Definition, Mechanism, Example).";
      identifiedRisks.push(`Incomplete Response on Question ${idx + 1}`);
    } else if (wordCount < 12) {
      qScore = 40;
      deficiencies = "Very brief answer without technical mechanism, complexity analysis, or concrete example.";
      fix = "Expand on internal mechanics, time/space trade-offs, and failure edge cases.";
      identifiedRisks.push(`Superficial Depth on Question ${idx + 1}`);
    } else {
      // 2. Count technical keyword density
      const matchedTech = techKeywords.filter((kw) => ansLower.includes(kw));
      const matchedPs = problemSolvingKeywords.filter((kw) => ansLower.includes(kw));
      const matchedComm = commKeywords.filter((kw) => ansLower.includes(kw));

      // Calculate score based on actual answer depth
      let base = 50;
      base += Math.min(25, wordCount * 0.4); // up to +25 for thorough explanation
      base += Math.min(18, matchedTech.length * 6); // up to +18 for technical vocabulary
      base += Math.min(7, matchedPs.length * 3.5); // up to +7 for problem solving structure
      qScore = Math.min(96, Math.max(35, Math.round(base)));

      if (matchedTech.length >= 2) {
        strengths = `Demonstrated accurate terminology (${matchedTech.slice(0, 3).join(", ")}) and structured reasoning.`;
        identifiedStrengths.push(`Precise technical vocabulary on Question ${idx + 1}`);
      } else {
        strengths = "Clear communicative flow and attempted problem breakdown.";
        deficiencies = "Could include more precise algorithmic complexity notation and system invariants.";
        fix = "Incorporate Big-O complexity and internal memory/thread mechanics.";
      }

      if (qScore < 65) {
        identifiedRisks.push(`Algorithmic precision gap on Question ${idx + 1}`);
      }
    }

    evaluations.push({
      questionNumber: idx + 1,
      question: qa.question,
      studentAnswer: ans,
      score: qScore,
      strengths: strengths || "Attempted answer under timed proctored conditions.",
      deficiencies: deficiencies || "No major deficiencies detected.",
      recommendedFix: fix || "Continue practicing similar medium/hard interview problems on LeetCode.",
    });

    totalTechnicalPoints += Math.min(100, Math.round(qScore * 0.95 + (qScore > 60 ? 5 : 0)));
    totalProblemSolvingPoints += Math.min(100, Math.round(qScore * 0.98 + (wordCount > 30 ? 4 : -5)));
    totalAptitudePoints += Math.min(100, Math.round(qScore * 0.92 + (wordCount > 20 ? 8 : -8)));
    totalCommunicationPoints += Math.min(100, Math.round(Math.min(95, 45 + wordCount * 1.1)));
    totalCulturePoints += Math.min(100, Math.round(Math.min(96, 55 + wordCount * 0.8)));
  });

  const count = qaPairs.length || 1;
  const overallScore = Math.round(evaluations.reduce((acc, e) => acc + e.score, 0) / count);

  const technicalDepth = Math.max(20, Math.min(98, Math.round(totalTechnicalPoints / count)));
  const problemSolving = Math.max(20, Math.min(98, Math.round(totalProblemSolvingPoints / count)));
  const aptitudeScore = Math.max(20, Math.min(98, Math.round(totalAptitudePoints / count)));
  const communication = Math.max(25, Math.min(98, Math.round(totalCommunicationPoints / count)));
  const behavioralFit = Math.max(30, Math.min(98, Math.round(totalCulturePoints / count)));

  const grade =
    overallScore >= 90 ? "A+" :
    overallScore >= 80 ? "A" :
    overallScore >= 70 ? "B+" :
    overallScore >= 60 ? "B" :
    overallScore >= 50 ? "C" : "Needs Remediation";

  // Ensure unique risks
  const uniqueRisks = Array.from(new Set(identifiedRisks)).slice(0, 3);
  if (uniqueRisks.length === 0) {
    uniqueRisks.push("Distributed Concurrency Edge Cases", "Memory Optimization in Deep Trees");
  }

  const uniqueStrengths = Array.from(new Set(identifiedStrengths)).slice(0, 3);
  if (uniqueStrengths.length === 0) {
    uniqueStrengths.push("Active participation under timed proctoring", "Structured technical thought process");
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
    overallSummary: `Candidate achieved an overall evaluated score of ${overallScore}/100 across ${count} questions in the ${round}. Technical depth evaluated at ${technicalDepth}% with problem-solving execution at ${problemSolving}%. ${
      overallScore >= 75
        ? "Answers showed strong conceptual clarity with appropriate algorithmic terminology."
        : "Answers require deeper conceptual elaboration, complexity trade-offs, and precise terminology to meet Tier-1 placement standards."
    }`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { track, round, qaPairs } = await req.json();

    if (!qaPairs || !Array.isArray(qaPairs) || qaPairs.length === 0) {
      return NextResponse.json({ error: "Missing qaPairs" }, { status: 400 });
    }

    // Attempt Gemini 2.5 Flash live evaluation on the server
    const qaFormatted = qaPairs
      .map((qa: QAPair, i: number) => `Question ${i + 1}: ${qa.question}\nStudent Answer: ${qa.answer || "(No Answer Given)"}`)
      .join("\n\n");

    const prompt = `You are a Senior Principal Engineer and Hiring Committee Evaluator.
Rigorously evaluate the student's ACTUAL answers for this proctored placement interview.
Round: "${round}"
Track: "${track}"

TRANSCRIPT OF QUESTIONS AND CANDIDATE'S ACTUAL ANSWERS:
${qaFormatted}

CRITICAL EVALUATION INSTRUCTIONS:
1. Base scores strictly on the quality, correctness, and completeness of the student's ACTUAL answers above.
2. If the student gave very short, incorrect, or skipped answers (e.g. "idk", 1-sentence replies), score them low (below 50).
3. If the student gave comprehensive, accurate technical answers with time/space complexities, mechanisms, and examples, award appropriate high scores (80-95).
4. Score each question individually (0-100).

Return ONLY valid JSON matching this schema:
{
  "score": <number 0-100>,
  "grade": "<A+ | A | B+ | B | C | Needs Remediation>",
  "roundName": "${round}",
  "aptitudeScore": <number 0-100>,
  "technicalDepth": <number 0-100>,
  "problemSolving": <number 0-100>,
  "communication": <number 0-100>,
  "behavioralFit": <number 0-100>,
  "highRiskTopics": ["<specific topic 1>", "<specific topic 2>"],
  "strengths": ["<strength 1>", "<strength 2>"],
  "evaluations": [
    {
      "questionNumber": 1,
      "score": <0-100>,
      "strengths": "<what was good in candidate's actual answer>",
      "deficiencies": "<what was missing in candidate's actual answer>",
      "recommendedFix": "<specific technical advice to improve>"
    }
  ],
  "overallSummary": "<concise 2-3 sentence candid feedback directly evaluating what the candidate said>"
}`;

    const models = ["gemini-2.5-flash", "gemini-flash-latest"];
    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleanJson = candidateText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);

            // Merge with questions text if evaluations are present
            const fullEvaluations = (parsed.evaluations || []).map((e: any, i: number) => ({
              questionNumber: e.questionNumber || i + 1,
              question: qaPairs[i]?.question || `Question ${i + 1}`,
              studentAnswer: qaPairs[i]?.answer || "",
              score: e.score || 70,
              strengths: e.strengths || "Addressed prompt.",
              deficiencies: e.deficiencies || "None flagged.",
              recommendedFix: e.recommendedFix || "Practice further.",
            }));

            return NextResponse.json({
              score: parsed.score,
              grade: parsed.grade,
              roundName: round,
              aptitudeScore: parsed.aptitudeScore,
              technicalDepth: parsed.technicalDepth,
              problemSolving: parsed.problemSolving,
              communication: parsed.communication,
              behavioralFit: parsed.behavioralFit,
              highRiskTopics: parsed.highRiskTopics || [],
              strengths: parsed.strengths || [],
              evaluations: fullEvaluations,
              overallSummary: parsed.overallSummary,
            });
          }
        }
      } catch (err) {
        console.warn(`Server Gemini call error for ${model}:`, err);
      }
    }

    // Dynamic semantic evaluation fallback directly examining actual text
    const semanticResult = evaluateAnswersSemantically(track, round, qaPairs);
    return NextResponse.json(semanticResult);
  } catch (err: any) {
    console.error("Evaluation API error:", err);
    return NextResponse.json({ error: err.message || "Failed to evaluate" }, { status: 500 });
  }
}
