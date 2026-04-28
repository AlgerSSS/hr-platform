import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { jd, resume } = body;

  if (!jd || !resume) {
    return NextResponse.json({ ok: false, error: "jd and resume are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  const prompt = `你是一位专业的 HR 招聘顾问。请分析以下候选人简历与岗位 JD 的匹配程度。

## 岗位 JD
${jd}

## 候选人简历
姓名：${resume.name}
学历：${resume.degree}
工作经验：${resume.experience}
期望职位：${resume.expectPosition}
期望薪资：${resume.expectSalary}
技能：${resume.skills?.join("、") || "无"}

工作经历：
${resume.workExperiences?.map((w: { company: string; position: string; startDate: string; endDate: string; description: string }) =>
  `- ${w.company} | ${w.position} | ${w.startDate}~${w.endDate}\n  ${w.description}`
).join("\n") || "无"}

教育经历：
${resume.educationExperiences?.map((e: { school: string; major: string; degree: string }) =>
  `- ${e.school} | ${e.major} | ${e.degree}`
).join("\n") || "无"}

自我评价：${resume.selfEvaluation || "无"}

请严格按以下 JSON 格式返回，不要输出任何其他内容：
{
  "score": <0-100的整数>,
  "summary": "<一句话总结匹配情况，20字以内>",
  "strengths": ["<优势1>", "<优势2>", "<优势3>"],
  "risks": ["<风险点1>", "<风险点2>"],
  "greeting": "<推荐的招呼话术，50字以内>"
}`;

  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/AlgerSSS/hr-platform",
        "X-Title": "HR Platform",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json({ ok: false, error: `OpenRouter error: ${errText}` }, { status: 500 });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    return NextResponse.json({ ok: true, data: parsed });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
