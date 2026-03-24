import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk'; // Or OpenAI/Google SDK
import 'dotenv/config';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `You are an expert UX/UI Designer and Frontend Engineer.
Review this screenshot of a React/Tailwind web game. Identify any visual bugs, UX misses, or layout issues.
Specifically look for:
1. Text overflow or overlapping elements.
2. Elements hidden off-screen requiring unnecessary scrolling.
3. Unlabeled numbers or confusing UI states (e.g., floating timers).
4. Contrast or alignment issues.

Output your findings as a strict Markdown checklist formatted for a developer to fix. Start each task with a '[ ] Task:'. Include the exact Tailwind classes to add/remove if possible.`;

async function reviewScreenshots() {
  const files = fs.readdirSync('./ux-screenshots').filter(f => f.endsWith('.png'));
  let finalSpec = '# UX/UI Polish Specification\n\n';

  for (const file of files) {
    console.log(`Analyzing ${file}...`);
    const imageBuffer = fs.readFileSync(`./ux-screenshots/${file}`);
    const base64Image = imageBuffer.toString('base64');

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: base64Image } },
          { type: "text", text: PROMPT }
        ]
      }]
    });

    finalSpec += `## Screen: ${file}\n${response.content[0].text}\n\n`;
  }

  fs.writeFileSync('UX_SPEC.md', finalSpec);
  console.log('Done! UX_SPEC.md generated.');
}

reviewScreenshots();