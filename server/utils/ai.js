export async function generateFeedbackReport(transcript, interviewType) {
  const prompt = `
    You are an expert technical and behavioral interviewer. Review the following transcript of an AI mock interview.
    The interview type was: ${interviewType}.

    Please provide a detailed feedback report in Markdown format.
    Your report should include:
    1. An overall summary of the candidate's performance.
    2. Strengths (what they did well).
    3. Areas for Improvement (where they can improve).
    4. Specific feedback on their answers, noting if they used the STAR method where appropriate.
    5. A final score out of 10.

    Transcript:
    ${transcript}
  `;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "API Key missing. Unable to generate report.";
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "No feedback generated from AI.";
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating feedback report.";
  }
}
