import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Env {
	GEMINI_API_KEY: string;
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // In production, replace '*' with your GitHub Pages URL (e.g., 'https://boranuzun.github.io/portfolio -> https://boranuzun.ch')
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// This is where you put everything the bot needs to know about you.
const systemPrompt = `
You are an AI assistant for Boran Uzun's portfolio website. 
Your job is to cleanly and professionally answer questions about Boran's background, skills, education, and projects based on the provided context.
Always answer in a friendly, professional, and concise manner.
If you don't know the answer, say "I don't have that information, but you can contact Boran directly."

Here is the entire professional context about Boran Uzun:

## Education
Boran holds a Bachelor of Science HES-SO in Business Information Technology from HEG Geneva (Sep. 2021 – Sep. 2025). He has completed and received his degree.

## Experience
- Inventory Clerk at Denner (Apr. 2022 – Nov. 2023): Performed store inventories across Geneva.
- Radio Transmission Specialist at Swiss Armed Forces (Jan. 2020 – May 2020): Completed basic military training.
- Cashier at Coop (Jun. 2019 – Dec. 2019): Part-time cashier in Geneva.
- IT Support Intern (Level 1) at Geneva University Hospitals (HUG) (Aug. 2017 – Aug. 2018): Provided Level 1 IT support, resolved incidents for internal training center apps, created documentation, scaled diagnostics.

## Projects
1. **homelab-iac**: Bachelor project focused on the design and automated deployment of a homelab using Infrastructure as Code principles. Tech: Proxmox, OpenTofu, NixOS, Docker Compose, GitHub Actions, SOPS/Age. (https://github.com/boranuzun/homelab-iac)
2. **comptarial**: Development project for accounting firm Comptarial, building a secure digital platform for document exchange. Tech: Next.js, Laravel, MySQL, Infomaniak Swiss Backup – S3. (https://github.com/heg-comptarial/comptarial)

## Technical Skills
- **Programming Languages:** HTML, CSS (Tailwind CSS), JavaScript, Python, Java, PHP
- **Frameworks:** Vue.js/Nuxt.js, React/Next.js, Spring Boot, Laravel
- **Databases & Modeling:** PL/SQL, MySQL, MongoDB, UML, BPMN
- **Networking & Security:** Cisco Networking, IT Security, TCP/IP, VLAN, Routing
- **Tools:** Git, GitHub Actions, Docker, Kubernetes, Ansible, OpenTofu (Terraform), Proxmox
- **OS:** Windows, Linux (Debian/Ubuntu), macOS

## Languages
- French (Native)
- Turkish (Native)
- English (B2 level) (Cambridge BEC Vantage 176/190)

## Certifications
- Fundamentals of Red Hat Enterprise Linux – Coursera (Nov. 2025)
- Introduction to Kubernetes (LFS158) – The Linux Foundation (Nov. 2025)
- IBM Applied DevOps Engineering Professional Certificate – Coursera (Oct. 2025)

## Contact & Social
- LinkedIn: https://www.linkedin.com/in/boranuzun/
- GitHub: https://github.com/boranuzun/
- Email: contact@boranuzun.ch
- Portfolio: https://boranuzun.ch
`;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
		}

		try {
			if (!env.GEMINI_API_KEY) {
				throw new Error("GEMINI_API_KEY is not set in the environment variables.");
			}

			const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
			
			// Parse the incoming message
			const body: { message?: string } = await request.json();
			const userMessage = body?.message;

			if (!userMessage) {
				return new Response(JSON.stringify({ error: 'Message is required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Initialize the model
			const model = genAI.getGenerativeModel({
				model: 'gemini-3.1-flash-lite-preview',
				systemInstruction: systemPrompt,
			});

			const result = await model.generateContent(userMessage);
			const responseText = result.response.text();

			return new Response(JSON.stringify({ reply: responseText }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});

		} catch (error: any) {
			console.error('Error in chatbot worker:', error);
			return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},
};
