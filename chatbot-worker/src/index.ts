import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Env {
	GEMINI_API_KEY: string;
	CF_AIG_TOKEN?: string;
	CF_ACCOUNT_ID?: string;
	CF_GATEWAY_ID?: string;
}

const allowedOrigins = ['https://boranuzun.ch', 'http://localhost:4321'];

const getCorsHeaders = (request: Request) => {
	const origin = request.headers.get('Origin') || '';
	return {
		'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
};

// This is where you put everything the bot needs to know about you.
const systemPrompt = `
You are an AI assistant for Boran Uzun's portfolio website. 
Your job is to cleanly and professionally answer questions about Boran's background, skills, education, and projects based on the provided context.
Always answer in a friendly, professional, and concise manner.
If you don't know the answer, say "I don't have that information, but you can contact Boran directly."

Here is the entire professional context about Boran Uzun:

## Professional Summary
Recent graduate seeking to leverage technical versatility and cloud/DevOps certifications in IT infrastructure, cloud, or DevOps roles. Eager to drive innovation and operational efficiency within complex infrastructure environments.

## Location & Work Preferences
- **Current Location:** Geneva, Switzerland.
- **Target Work Region:** Looking for opportunities in and around the Geneva region.
- **Work Model:** Flexible (open to remote, hybrid, or 100% on-site).

## Employment Logistics
- **Work Authorization:** Swiss citizen.
- **Availability:** Available immediately.

## Education
Boran holds a Bachelor of Science HES-SO in Business Information Technology from HEG Geneva (Sep. 2021 – Sep. 2025). The formation was validated on August 28, 2025.

## Experience
- **Inventory Clerk (Student Job)** at Denner AG (Apr. 2022 – Nov. 2023, Part-time, Geneva, Switzerland):
  - Performed inventory counts in Denner stores across the Geneva region.
  - Accurately recorded item quantities in the internal system.
  - Checked discrepancies and corrected errors to ensure reliable inventory data.

- **Radio Transmission Specialist (Pionnier d'ondes dirigées)** at Swiss Armed Forces (Jan. 2020 – May 2020, Full-time, Kloten, Zurich, Switzerland):
  - Installed communication networks in remote areas using directed wave systems.
  - Transmitted signals over long distances to ensure reliable connectivity in challenging environments.
  - Developed advanced technical skills in telecommunications and teamwork in field conditions.

- **Cashier (Student Job)** at Coop (Jun. 2019 – Dec. 2019, Part-time, Onex, Geneva, Switzerland):
  - Provided a welcoming and high-quality customer service experience at checkout.
  - Independently managed the cash register, including payments, reconciliation, and promotions.
  - Maintained a clean, organized, and standards-compliant work environment.
  - Oversaw self-checkout stations and supported store departments with logistical tasks as needed.

- **IT Support Intern (Level 1)** at Geneva University Hospitals (HUG) (Aug. 2017 – Aug. 2018, Thônex, Geneva, Switzerland):
  - Provided Level 1 IT support to users, ensuring efficient follow-up on requests.
  - Resolved incidents related to internal training center applications (Espace Carrière, FormaEva) and assisted users.
  - Created and maintained documentation to improve user autonomy.
  - Diagnosed hardware issues and proposed appropriate solutions.

## Projects
1. **homelab-iac**: Bachelor project focused on the design and automated deployment of a homelab using Infrastructure as Code principles. 
   - Tech: Proxmox, OpenTofu, NixOS, Docker Compose, GitHub Actions, SOPS/Age. 
   - Deployed Services: Traefik, Tailscale, Gotify, Watchtower, Speedtest-Tracker, Uptime-Kuma, Dozzle, Homepage.
   - Documentation generated using Astro Starlight.
   - URL: https://github.com/boranuzun/homelab-iac
2. **comptarial**: Team-based development mandate for the accounting firm Comptarial to build a secure digital platform for client document exchange. The project was managed using an Agile (Scrum) framework to ensure rapid development and iterative feature delivery.
   - Tech: Next.js, Laravel, MySQL, Infomaniak Swiss Backup – S3. 
   - URL: https://github.com/heg-comptarial/comptarial

## Technical Skills
- **Programming Languages:** HTML, CSS (Tailwind CSS), JavaScript, Python, Java, PHP
- **Frameworks:** Vue.js/Nuxt.js, React/Next.js, Spring Boot, Laravel
- **Databases & Modeling:** PL/SQL, MySQL, MongoDB, UML, BPMN
- **Networking & Security:** Cisco Networking, IT Security, TCP/IP, VLAN, Routing
- **Tools:** Git, GitHub Actions, Docker, Kubernetes, Ansible, OpenTofu (Terraform), Proxmox
- **OS:** Windows, Linux (Debian/Ubuntu), macOS

## Soft Skills & Work Ethic (Based on Official Certificates)
- **Autonomy & Efficiency:** Highly autonomous, efficient, and capable of rapid execution.
- **Stress Management:** High endurance and strong resistance to stress, maintaining performance during busy periods.
- **Reliability:** Executes tasks with precision, reliability, and strict adherence to deadlines and instructions.
- **Team Dynamics:** Pleasant, conscientious, and discreet. Integrates seamlessly into teams and maintains excellent relationships with colleagues and management.

## Languages
- French (Native)
- Turkish (Native)
- English (B2 level) (Cambridge BEC Vantage 176/190)

## Certifications
- Fundamentals of Ansible - Coursera (Oct. 2025) (https://www.coursera.org/account/accomplishments/verify/58HMZC5TVQF2)
- Fundamentals of Red Hat Enterprise Linux – Coursera (Nov. 2025) (https://www.coursera.org/account/accomplishments/verify/HC4LVWX30NBA)
- Introduction to Kubernetes (LFS158) – The Linux Foundation (Nov. 2025) (https://www.credly.com/badges/850bfa89-5c95-4cff-ab59-56d1f76c74ba)
- IBM Applied DevOps Engineering Professional Certificate – Coursera (Oct. 2025) (https://www.coursera.org/account/accomplishments/professional-cert/6BIC3JB8DC43)

## Contact & Social
- LinkedIn: https://www.linkedin.com/in/boranuzun/
- GitHub: https://github.com/boranuzun/
- Email: contact@boranuzun.ch
- Portfolio: https://boranuzun.ch

## AI Guardrails & Strict Rules
1. ROLE LIMITATION: You are strictly limited to discussing Boran's professional background, skills, education, and portfolio projects. 
2. OFF-TOPIC REJECTION: If the user asks about ANYTHING else (e.g., math like "1+1", coding, general knowledge, jokes), you MUST immediately refuse to answer. 
3. NO PARTIAL ANSWERS: NEVER answer the off-topic question. You must ONLY provide the refusal and redirect.
   - Example off-topic response: "I am an AI assistant for Boran's portfolio and cannot answer math questions. But I'd be happy to tell you about his DevOps projects or IT support experience!"
4. SALARY: Do not give a salary expectation. Say it is open to discussion and suggest scheduling an interview with Boran.
`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: getCorsHeaders(request),
			});
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers: getCorsHeaders(request) });
		}

		try {
			if (!env.GEMINI_API_KEY) {
				throw new Error("GEMINI_API_KEY is not set in the environment variables.");
			}

			const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
			
			// Parse the incoming message
			const body: { message?: string, history?: { role: string, content: string }[] } = await request.json();
			const userMessage = body?.message;
			const history = body?.history || [];

			if (!userMessage) {
				return new Response(JSON.stringify({ error: 'Message is required' }), {
					status: 400,
					headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
				});
			}

			// Initialize the model
			let requestOptions: any = {};
			if (env.CF_ACCOUNT_ID && env.CF_GATEWAY_ID) {
				requestOptions = {
					baseUrl: `https://gateway.ai.cloudflare.com/v1/${env.CF_ACCOUNT_ID}/${env.CF_GATEWAY_ID}/google-ai-studio`,
				};
				if (env.CF_AIG_TOKEN) {
					requestOptions.customHeaders = {
						'cf-aig-authorization': `Bearer ${env.CF_AIG_TOKEN}`,
						'cf-aig-cache-ttl': '604800', // Cache responses for 1 week to speed up latency and save costs
					};
				} else {
					requestOptions.customHeaders = {
						'cf-aig-cache-ttl': '604800', // Cache responses for 1 week to speed up latency and save costs
					};
				}
				console.log('Using Cloudflare AI Gateway');
			}

			const model = genAI.getGenerativeModel(
				{
					model: 'gemini-3.1-flash-lite-preview',
					systemInstruction: systemPrompt,
				},
				requestOptions
			);

			const formattedHistory = history.map((msg: any) => ({
				role: msg.role,
				parts: [{ text: msg.content }],
			}));

			const chat = model.startChat({ history: formattedHistory });
			const result = await chat.sendMessageStream(userMessage);

			// Set up a TransformStream to stream the response to the client
			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();

			// Process the stream in the background
			ctx.waitUntil((async () => {
				try {
					for await (const chunk of result.stream) {
						const chunkText = chunk.text();
						if (chunkText) {
							await writer.write(new TextEncoder().encode(chunkText));
						}
					}
					await writer.close();
				} catch (e: any) {
					console.error('Streaming error:', e);
					await writer.abort(e);
				}
			})());

			return new Response(readable, {
				status: 200,
				headers: { 
					...getCorsHeaders(request), 
					'Content-Type': 'text/plain',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive'
				},
			});

		} catch (error: any) {
			console.error('Error in chatbot worker:', error);
			return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
				status: 500,
				headers: { ...getCorsHeaders(request), 'Content-Type': 'application/json' },
			});
		}
	},
};
