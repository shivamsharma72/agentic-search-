import { generateText } from "ai";
import { getPolarTrackedModel } from "../polar-llm-strategy";
import { InfluenceItem, ClusterMeta, Evidence } from "../forecasting/types";

// Get model dynamically to use current context
const getModel = () => getPolarTrackedModel("gpt-5-mini");

export async function conciseReporterAgent(
  question: string,
  p0: number,
  pNeutral: number,
  pAware: number | undefined,
  influence: InfluenceItem[],
  clusters: ClusterMeta[],
  drivers: string[],
  evidence: Evidence[],
  topN = 12 // Increased to show more evidence
) {
  const top = [...influence]
    .sort((a, b) => b.deltaPP - a.deltaPP)
    .slice(0, topN);

  // Lookup maps
  const evidenceMap = evidence.reduce((map, ev) => {
    map[ev.id] = ev;
    return map;
  }, {} as Record<string, Evidence>);

  const topEvidenceWithClaims = top.map((t) => {
    const ev = evidenceMap[t.evidenceId];
    return {
      id: t.evidenceId,
      claim: ev?.claim || "Evidence not found",
      polarity: ev?.polarity || 0,
      deltaPP: t.deltaPP,
      type: ev?.type || "Unknown",
      publishedAt: ev?.publishedAt || "n/a",
      urls: ev?.urls || [],
      verifiability: ev?.verifiability ?? 0,
    };
  });

  // Separate pro and con evidence for table
  const proEvidence = topEvidenceWithClaims
    .filter((e) => e.polarity > 0)
    .slice(0, 6);
  const conEvidence = topEvidenceWithClaims
    .filter((e) => e.polarity < 0)
    .slice(0, 6);

  const predictionDirection = pNeutral > 0.5 ? "YES" : "NO";
  const confidence = Math.abs(pNeutral - 0.5) * 200;

  // Create markdown table for pros
  const proTable = `| Supporting Evidence | Impact | Reliability | Source |
|---------------------|--------|-------------|---------|
${proEvidence
  .map((e) => {
    // Better source extraction
    let source = "Research Database";
    if (e.urls && e.urls.length > 0) {
      try {
        const url = new URL(e.urls[0]);
        source = url.hostname.replace(/^www\./, "").replace(/\.[^.]+$/, ""); // Remove www and TLD
        // Capitalize first letter
        source = source.charAt(0).toUpperCase() + source.slice(1);
      } catch {
        // If URL parsing fails, try to extract from raw string
        const match = e.urls[0].match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
        source = match
          ? match[1].charAt(0).toUpperCase() + match[1].slice(1)
          : "Research Database";
      }
    }
    const impact = `+${(e.deltaPP * 100).toFixed(1)}pp`;
    const reliability = `${(e.verifiability * 100).toFixed(0)}%`;
    const evidenceText =
      e.claim.slice(0, 70) + (e.claim.length > 70 ? "..." : "");
    return `| ${evidenceText} | ${impact} | ${reliability} | ${source} |`;
  })
  .join("\n")}`;

  // Create markdown table for cons
  const conTable = `| Opposing Evidence | Impact | Reliability | Source |
|--------------------|--------|-------------|---------|
${conEvidence
  .map((e) => {
    // Better source extraction
    let source = "Research Database";
    if (e.urls && e.urls.length > 0) {
      try {
        const url = new URL(e.urls[0]);
        source = url.hostname.replace(/^www\./, "").replace(/\.[^.]+$/, ""); // Remove www and TLD
        // Capitalize first letter
        source = source.charAt(0).toUpperCase() + source.slice(1);
      } catch {
        // If URL parsing fails, try to extract from raw string
        const match = e.urls[0].match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
        source = match
          ? match[1].charAt(0).toUpperCase() + match[1].slice(1)
          : "Research Database";
      }
    }
    const impact = `${(e.deltaPP * 100).toFixed(1)}pp`;
    const reliability = `${(e.verifiability * 100).toFixed(0)}%`;
    const evidenceText =
      e.claim.slice(0, 70) + (e.claim.length > 70 ? "..." : "");
    return `| ${evidenceText} | ${impact} | ${reliability} | ${source} |`;
  })
  .join("\n")}`;

  const prompt = `
You are writing a clear, well-organized forecast report for a hackathon presentation. Make it visually appealing and easy to scan.

ANALYSIS RESULTS:
- Prediction: ${predictionDirection} (${(pNeutral * 100).toFixed(1)}%)
- Confidence: ${confidence.toFixed(1)}%
- Base rate: ${(p0 * 100).toFixed(1)}%
- Key drivers: ${drivers.join(", ") || "n/a"}

EVIDENCE TABLES (DO NOT RECREATE - WILL BE INSERTED):
${proEvidence.length} pieces of supporting evidence
${conEvidence.length} pieces of opposing evidence

Question: ${question}

FORMAT REQUIREMENTS (Follow this EXACT structure):

# 🎯 Prediction: ${predictionDirection} (${(pNeutral * 100).toFixed(1)}%)

Write 1-2 sentences explaining the prediction clearly.

---

## 📊 Evidence Summary

Write 2-3 sentences summarizing what the evidence tables below show. Mention the balance between pro and con evidence.

### ✅ Arguments FOR (${proEvidence.length} pieces)

[PRO_TABLE_PLACEHOLDER]

**Key Takeaways:**
- Write 2-3 bullet points (1 sentence each) summarizing the strongest pro arguments
- Focus on the highest-impact evidence from the table

### ❌ Arguments AGAINST (${conEvidence.length} pieces)

[CON_TABLE_PLACEHOLDER]

**Key Takeaways:**
- Write 2-3 bullet points (1 sentence each) summarizing the strongest con arguments
- Focus on the highest-impact evidence from the table

---

## 💡 Analysis

### Why This Prediction?
Write 1-2 SHORT paragraphs (2-3 sentences each) explaining:
- What the evidence pattern shows
- Why this specific probability makes sense

Keep it BRIEF and digestible. Focus on the key insight, not exhaustive explanation.

### What Could Change?
List 3-4 specific events that would shift this prediction (1 sentence each):
- **Event/Factor**: Brief impact explanation

STYLE GUIDELINES:
- Clear section headers with emojis
- Short paragraphs (3-4 sentences max)
- Bullet points for lists
- NO technical jargon
- Focus on "what" and "why"
- Be specific and concrete
`;

  const { text } = await generateText({
    model: getModel(),
    system: `Write clear, well-structured Markdown with proper formatting. Use section breaks (---) and clear headers. Be concise but thorough.`,
    prompt,
  });

  // Insert the actual tables
  let finalReport = text;
  finalReport = finalReport.replace("[PRO_TABLE_PLACEHOLDER]", proTable);
  finalReport = finalReport.replace("[CON_TABLE_PLACEHOLDER]", conTable);

  return finalReport;
}
