const Employee = require("../models/Employee");
const fetch = require("node-fetch");

// POST /api/ai/recommend
const getRecommendations = async (req, res, next) => {
  try {
    const { employeeIds, department, analysisType } = req.body;

    // Fetch employees — either specific ones or all (optionally filtered by dept)
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

    const type = analysisType || "full"; // full | promotion | training | ranking

    const employeeList = employees
      .map(
        (e, i) =>
          `${i + 1}. ${e.name} | Dept: ${e.department} | Skills: ${e.skills.join(", ")} | Performance Score: ${e.performanceScore}/100 | Experience: ${e.experience} year(s)`
      )
      .join("\n");

    const prompts = {
      promotion: `You are an HR analytics AI. Based on the following employee data, identify who should be considered for promotion and why.`,
      training: `You are an HR analytics AI. Based on the following employee data, suggest personalized training programs for each employee to improve their performance.`,
      ranking: `You are an HR analytics AI. Rank the following employees from best to worst performer and justify each ranking.`,
      full: `You are an HR analytics AI. Perform a comprehensive analysis of the following employees. For each employee provide: promotion readiness, training suggestions, and an overall performance feedback.`,
    };

    const systemPrompt = prompts[type] || prompts.full;

    const prompt = `${systemPrompt}

Employee Data:
${employeeList}

Respond in this exact JSON format:
{
  "analysis": [
    {
      "name": "Employee Name",
      "rank": 1,
      "promotionRecommendation": "Recommended / Not Recommended / Under Review",
      "promotionReason": "Brief reason",
      "trainingSuggestions": ["Suggestion 1", "Suggestion 2"],
      "aiFeedback": "Overall 2-3 sentence performance feedback",
      "performanceLabel": "Excellent / Good / Average / Needs Improvement"
    }
  ],
  "summary": "2-3 sentence overall team summary"
}`;

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
      data: merged,
      summary: aiResult.summary,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
