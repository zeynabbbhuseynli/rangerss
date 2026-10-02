# Future live AI connection — not enabled

No backend has been deployed and no AI credentials are present. The first beta uses authored story replies. The app's optional future connection expects an HTTPS `RANGER_API_URL` supplied at build time. Never embed an AI API key in the app.

Expected endpoint: POST /chat
Authorization: Bearer <tester-entered access code>
JSON request: character (oakley or fernan), messages (last eight user/assistant messages), progress (stamps, points, nextPlant).
JSON response: {"text":"Character reply"}

The app restricts this to non-Kid mode after an adult tester opts in. This consent UI is not a substitute for any legal review or verified parental consent for a child-targeted AI service. Do not enable an unrestricted child-facing model in this beta.

Before connecting: implement server-side authentication, request/usage limits, input and output safety checks, strictly controlled character prompts, timeout handling, minimal logging, a privacy disclosure and provider credentials stored only as server secrets. Treat all client data as untrusted. Do not forward raw user messages as system instructions. Never imply the characters can see a visitor, know live park conditions, or summon help.

Fernan: playful, curious, short replies, light botanical wordplay, encourages observation.
Oakley: calm, encouraging, patient, clear hints and accurate plant information.
Both: fictional companions; real-world help comes from a trusted adult or park staff.

The existing text/voice interface can call another provider through this contract without installing an OpenAI plugin.
