const fs = require('fs');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Call Groq API to transform content
 */
async function callGroq(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a technical writer for a SaaS product called Gameball. Your job is to transform raw product requirements and user stories into polished, customer-facing release notes.

Rules:
1. Write in active voice, present tense
2. Focus on user benefits, not technical implementation
3. Be concise - 1-2 sentences for descriptions
4. Use professional but friendly tone
5. Never use "As a... I want... So that..." format
6. Remove all internal references, ticket IDs, dates in titles
7. Convert technical jargon to user-friendly language
8. Output valid JSON only - no markdown, no explanations`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Clean a feature object
 */
async function transformFeature(feature) {
  const prompt = `Transform this product feature into a clean release note entry.

Input:
${JSON.stringify(feature, null, 2)}

Output a JSON object with this exact structure:
{
  "title": "Clean feature title without dates, ticket IDs, or prefixes like [HSA]",
  "platform": "${feature.platform || 'All'}",
  "plan": "${feature.plan || 'Shopify & Salla: Free / Pro / GURU · Selfserve: Starter / Growth / Enterprise'}",
  "channel": "${feature.channel || 'All'}",
  "description": "1-2 sentence marketing description focusing on user benefit",
  "capabilities": [
    {
      "title": "Capability category name",
      "items": ["Clear benefit point 1", "Clear benefit point 2", "Clear benefit point 3"]
    }
  ]
}

Rules:
- Title should be clean and descriptive (e.g., "Coupon Image Support" not "[Due Date 5 Feb] HSA: Support Coupon Images")
- Description should explain what users can now do and why it matters
- Capabilities should have 1-3 categories with 2-4 bullet points each
- Each bullet point should be a clear, actionable benefit
- Remove all HTML tags
- Remove user story format (As a... I want... So that...)

Return ONLY the JSON object, no other text.`;

  const result = await callGroq(prompt);

  try {
    // Try to parse the JSON response
    const cleaned = JSON.parse(result.trim());
    return cleaned;
  } catch (e) {
    // If parsing fails, try to extract JSON from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    console.error('Failed to parse feature response:', result);
    return feature; // Return original if transformation fails
  }
}

/**
 * Clean an improvement object
 */
async function transformImprovement(improvement) {
  const prompt = `Transform this product improvement into a clean release note entry.

Input:
${JSON.stringify(improvement, null, 2)}

Output a JSON object with this exact structure:
{
  "title": "Clean improvement title",
  "overview": "Brief 1-2 sentence context of what was improved and why",
  "whatsNew": [
    {
      "title": "What's New category",
      "description": "Brief description of changes",
      "items": ["Specific improvement 1", "Specific improvement 2"]
    }
  ]
}

Rules:
- Title should be clean and descriptive
- Overview should explain the context briefly
- whatsNew should highlight key changes
- Remove all HTML tags and user story format
- Focus on what developers/users can now do

Return ONLY the JSON object, no other text.`;

  const result = await callGroq(prompt);

  try {
    const cleaned = JSON.parse(result.trim());
    return cleaned;
  } catch (e) {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    console.error('Failed to parse improvement response:', result);
    return improvement;
  }
}

/**
 * Transform entire release notes data
 */
async function transformReleaseNotes(data) {
  console.log('Transforming content with AI...');

  const transformed = {
    date: data.date,
    release: data.release,
    dateRange: data.dateRange,
    newFeatures: [],
    improvements: [],
    bugFixes: data.bugFixes || []
  };

  // Transform features
  if (data.newFeatures && data.newFeatures.length > 0) {
    console.log(`Transforming ${data.newFeatures.length} features...`);
    for (let i = 0; i < data.newFeatures.length; i++) {
      console.log(`  Feature ${i + 1}/${data.newFeatures.length}: ${data.newFeatures[i].title?.substring(0, 50)}...`);
      try {
        const transformed_feature = await transformFeature(data.newFeatures[i]);
        transformed.newFeatures.push(transformed_feature);
      } catch (error) {
        console.error(`  Error transforming feature: ${error.message}`);
        transformed.newFeatures.push(data.newFeatures[i]);
      }
    }
  }

  // Transform improvements
  if (data.improvements && data.improvements.length > 0) {
    console.log(`Transforming ${data.improvements.length} improvements...`);
    for (let i = 0; i < data.improvements.length; i++) {
      console.log(`  Improvement ${i + 1}/${data.improvements.length}: ${data.improvements[i].title?.substring(0, 50)}...`);
      try {
        const transformed_improvement = await transformImprovement(data.improvements[i]);
        transformed.improvements.push(transformed_improvement);
      } catch (error) {
        console.error(`  Error transforming improvement: ${error.message}`);
        transformed.improvements.push(data.improvements[i]);
      }
    }
  }

  console.log('Transformation complete!');
  return transformed;
}

// Main execution
async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath) {
    console.error('Usage: node transform-content.js <input.json> <output.json>');
    process.exit(1);
  }

  if (!GROQ_API_KEY) {
    console.error('Error: GROQ_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    const jsonContent = fs.readFileSync(inputPath, 'utf-8');
    const data = JSON.parse(jsonContent);

    const transformed = await transformReleaseNotes(data);

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
      console.log(`Saved transformed content to: ${outputPath}`);
    } else {
      console.log(JSON.stringify(transformed, null, 2));
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
