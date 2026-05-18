const Employee = require("../models/Employee");
const fetch = require("node-fetch");

// Build a type-specific prompt with a different response schema per analysis type
const buildPrompt = (type, employeeList) => {
  switch (type) {
    case "promotion":
      return {
        instruction: `You are an HR analytics AI. Evaluate each employee strictly for promotion eligibility based on their performance score, experience, and skills.`,
        format: `{
  "analysis": [
    {
      "name": "Employee Name",
      "promotionRecommendation": "Recommended / Not Recommended / Under Review",
      "promotionReason": "2-3 sentence justification focusing on performance score and experience",
      "readinessScore": 85
    }
  ],
  "summary": "Overall promotion pipeline summary in 2-3 sentences"
}`,
      };

    case "training":
      return {
        instruction: `You are an HR learning & development AI. For each employee, identify skill gaps and suggest specific, actionable training programs to improve their performance.`,
        format: `{
  "analysis": [
    {
      "name": "Employee Name",
      "currentLevel": "Junior / Mid / Senior",
      "skillGaps": ["Gap 1", "Gap 2"],
      "trainingSuggestions": ["Course/Program 1", "Course/Program 2", "Course/Program 3"],
      "priority": "High / Medium / Low",
      "trainingNote": "1-2 sentence note on why this training is important for this employee"
    }
  ],
  "summary": "Overall team training needs summary in 2-3 sentences"
}`,
      };

    case "ranking":
      return {
        instruction: `You are an HR analytics AI. Rank ALL employees from best to worst performer. Consider performance score, experience, and skill breadth. Be decisive — no ties.`,
        format: `{
  "analysis": [
    {
      "name": "Employee Name",
      "rank": 1,
      "performanceLabel": "Excellent / Good / Average / Needs Improvement",
      "rankingJustification": "2 sentence justification for this rank position",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1"]
    }
  ],
  "summary": "2-3 sentence summary of the overall team performance distribution"
}`,
      };

    case "full":
    default:
      return {
        instruction: `You are an HR analytics AI. Perform a comprehensive 360-degree analysis of each employee covering promotion readiness, training needs, and overall performance feedback.`,
        format: `{
  "analysis": [
    {
      "name": "Employee Name",
      "rank": 1,
      "performanceLabel": "Excellent / Good / Average / Needs Improvement",
      "promotionRecommendation": "Recommended / Not Recommended / Under Review",
      "promotionReason": "Brief reason",
      "trainingSuggestions": ["Suggestion 1", "Suggestion 2"],
      "strengths": ["Strength 1", "Strength 2"],
      "aiFeedback": "Overall 2-3 sentence performance feedback"
    }
  ],
  "summary": "2-3 sentence overall team summary"
}`,
      };
  }
};

// POST /api/ai/recommend
const getRecommendations = async (req, res, next) => {
  try {
    const { employeeIds, department, analysisType } = req.body;
    const type = analysisType || "full";

    // Fetch employees
    let employees;
    if (employeeIds && employeeIds.length > 0) {
      employees = await Employee.find({ _id: { $in: employeeIds } });
    } else if (department) {
      employees = await Employee.find({
        department: { $regex: department, $options: "i" },
      });
    } else {
      employees = await Employee.find().sort({ performanceScore: -1 });
    }

    if (employees.length === 0) {
      return res.json({
        success: true,
        message: "No employees found for analysis",
        data: null,
      });
    }

    const employeeList = employees
      .map(
        (e, i) =>
          `${i + 1}. ${e.name} | Dept: ${e.department} | Skills: ${e.skills.join(", ")} | Performance Score: ${e.performanceScore}/100 | Experience: ${e.experience} year(s)`
      )
      .join("\n");

    const { instruction, format } = buildPrompt(type, employeeList);

    const prompt = `${instruction}

Employee Data:
${employeeList}

Respond ONLY in this exact JSON format (no extra text, no markdown):
${format}`;

    const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": (process.env.FRONTEND_URL || "http://localhost:5174").trim(),
          "X-Title": "Employee Performance Analytics",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
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

    // Parse JSON from AI response
    let aiResult;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in AI response");
      aiResult = JSON.parse(jsonMatch[0]);
    } catch {
      return res.json({
        success: true,
        data: { raw: rawContent, parseError: true },
        employees,
        analysisType: type,
      });
    }

    // Merge AI analysis with employee DB data
    const merged = aiResult.analysis.map((item) => {
      const emp = employees.find(
        (e) => e.name.toLowerCase() === item.name.toLowerCase()
      );
      return {
        ...item,
        _id: emp?._id,
        email: emp?.email,
        department: emp?.department,
        skills: emp?.skills,
        performanceScore: emp?.performanceScore,
        experience: emp?.experience,
      };
    });

    res.json({
      success: true,
      count: merged.length,
      analysisType: type,
      data: merged,
      summary: aiResult.summary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
