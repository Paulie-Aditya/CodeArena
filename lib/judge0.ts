export const languageToJudge0: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
}

export type SubmitPayload = {
  language_id: number
  source_code: string
  test_cases: Array<{ input: string; output: string }>
}

export async function submitToJudge0(payload: SubmitPayload) {
  const res = await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Submission failed")
  return res.json()
} 