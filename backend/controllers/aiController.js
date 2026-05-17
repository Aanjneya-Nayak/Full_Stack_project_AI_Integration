const Candidate = require("../models/Candidate");
const fetch = require("node-fetch");

// POST /api/ai/shortlist — AI-based candidate ranking via OpenRouter
const aiShortlist = async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills, jobDescription } =
      req.body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "requiredSkills is required" });
    }

    const minExp = minExperience || 0;

    // Fetch candidates meeting minimum experience
    const candidates = await Candidate.find({
      experience: { $gte: minExp },
    });

    if (candidates.length === 0) {
      return res.json({
        success: true,
        message: "No candidates meet the minimum experience requirement",
        data: [],
        aiAnalysis: null,
      });
    }

    // Build candidate list string for the prompt
    const candidateList = candidates
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} | Skills: ${c.skills.join(", ")} | Experience: ${c.experience} year(s)${c.bio ? ` | Bio: ${c.bio}` : ""}`
      )
      .join("\n");

    const preferredNote =
      preferredSkills && preferredSkills.length > 0
        ? `Preferred skills: ${preferredSkills.join(", ")}.`
        : "";

    const jobDescNote = jobDescription
      ? `Job Description: ${jobDescription}`
      : "";

    const prompt = `You are a technical recruiter AI. Analyze the following candidates for a job opening and rank them.

Job Requirements:
- Required Skills: ${requiredSkills.join(", ")}
- Minimum Experience: ${minExp} year(s)
${preferredNote}
${jobDescNote}

Candidates:
${candidateList}

Instructions:
1. Rank ALL candidates from best to worst fit.
2. For each candidate provide:
   - Rank number
   - Name
   - Match tier: High / Medium / Low
   - A brief 1-2 sentence explanation of why they are or aren't a good fit
3. At the end, provide a 2-3 sentence overall summary of the best candidates.

Respond in this exact JSON format:
{
  "rankings": [
    {
      "rank": 1,
      "name": "Candidate Name",
      "tier": "High",
      "explanation": "Explanation here"
    }
  ],
  "summary": "Overall summary here"
}`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5174",
          "X-Title": "Candidate Shortlisting System",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return res.status(502).json({
        success: false,
        message: "OpenRouter API error",
        details: errText,
      });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response (handle markdown code blocks if present)
    let aiResult;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      aiResult = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      // If parsing fails, return raw text so frontend can still display it
      return res.json({
        success: true,
        data: candidates,
        aiAnalysis: { raw: rawContent, parseError: true },
      });
    }

    // Merge AI rankings with candidate data
    const rankedCandidates = aiResult.rankings
      .map((ranking) => {
        const candidate = candidates.find(
          (c) => c.name.toLowerCase() === ranking.name.toLowerCase()
        );
        return {
          rank: ranking.rank,
          _id: candidate?._id,
          name: ranking.name,
          email: candidate?.email,
          skills: candidate?.skills || [],
          experience: candidate?.experience,
          bio: candidate?.bio,
          tier: ranking.tier,
          aiExplanation: ranking.explanation,
        };
      })
      .filter((c) => c._id); // only include matched candidates

    res.json({
      success: true,
      count: rankedCandidates.length,
      data: rankedCandidates,
      summary: aiResult.summary,
    });
  } catch (err) {
    console.error("AI shortlist error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { aiShortlist };
