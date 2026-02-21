const fs = require('fs');
const html = fs.readFileSync('/home/giar/.gemini/antigravity/scratch/cv-builder/app.html', 'utf8');

const regex = /<div class="template-card"[^>]*data-template="([^"]+)"[^>]*>[\s\S]*?<div class="template-preview[^"]*">([\s\S]*?)<\/div>\s*<span class="template-name">/g;

let match;
const templates = {};
while ((match = regex.exec(html)) !== null) {
  const tplId = match[1];
  let innerHtml = match[2].trim();
  innerHtml = innerHtml.replace(/class="/g, 'className="');
  innerHtml = innerHtml.replace(/style="([^"]+)"/g, (match, p1) => {
    // Basic inline style to react style converter (if any)
    return match; // Hopefully none or we can fix manually
  });
  templates[tplId] = innerHtml;
}

let reactCode = `import { TemplateConfig } from '@/types/cv';

export default function TemplateThumbnail({ tpl, isActive }: { tpl: TemplateConfig, isActive: boolean }) {
    switch(tpl.id) {
`;

for (const [id, content] of Object.entries(templates)) {
    reactCode += `        case '${id}':\n`;
    reactCode += `            return (\n                <>\n                    ${content.replace(/\n/g, '\n                    ')}\n                </>\n            );\n`;
}

reactCode += `        default:\n            return <div />;\n    }\n}\n`;

fs.writeFileSync('/home/giar/.gemini/antigravity/scratch/easy-cv/components/editor/TemplateThumbnails.tsx', reactCode);
console.log("Generated TemplateThumbnails.tsx with " + Object.keys(templates).length + " templates.");
