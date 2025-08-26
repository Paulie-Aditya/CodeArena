import axios from "axios"

export async function POST(req: Request) {
  try {
    const { language_id, source_code, test_cases } = await req.json()
    const options = {
      method: "POST",
      url: `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      headers: {
        "x-rapidapi-key": process.env.JUDGE0_API_KEY!,
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        language_id,
        source_code,
        stdin: test_cases?.[0]?.input ?? "",
        expected_output: test_cases?.[0]?.output ?? "",
      },
    }
    const res = await axios.request(options)
    return new Response(JSON.stringify(res.data), { status: 200 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed"
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
} 