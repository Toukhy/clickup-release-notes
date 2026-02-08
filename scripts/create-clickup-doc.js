const fs = require('fs');
const path = require('path');

const CLICKUP_API_TOKEN = process.env.CLICKUP_API_TOKEN;
const CLICKUP_WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID || '3477524';
const CLICKUP_DOC_ID = process.env.CLICKUP_DOC_ID || '3a40m-33560';
const CLICKUP_PARENT_PAGE_ID = process.env.CLICKUP_PARENT_PAGE_ID || '3a40m-31220';

async function createClickUpPage(name, content) {
  const url = `https://api.clickup.com/api/v3/workspaces/${CLICKUP_WORKSPACE_ID}/docs/${CLICKUP_DOC_ID}/pages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': CLICKUP_API_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      parent_page_id: CLICKUP_PARENT_PAGE_ID,
      content: content
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ClickUp page: ${response.status} - ${error}`);
  }

  return response.json();
}

function extractPageName(content, filename) {
  // Try to extract release ID from content (e.g., "Release: Q3-W1" or "Release: 049")
  const releaseMatch = content.match(/\*\*Release:\*\*\s*([^\||\n]+)/i);
  const dateMatch = content.match(/\*\*Date:\*\*\s*(\d+)\s*of\s*(\w+)\s*(\d+)/i);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].substring(0, 2);
    const year = dateMatch[3].substring(2);

    // Format: R26.049-0205 (Year.Release-MonthDay)
    const releaseNum = releaseMatch ? releaseMatch[1].trim().replace(/[^0-9]/g, '') || '000' : '000';
    return `R${year}.${releaseNum.padStart(3, '0')}-${month}${day}`;
  }

  // Fallback to filename
  return path.basename(filename, '.md');
}

async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node create-clickup-doc.js <path-to-markdown-file>');
    process.exit(1);
  }

  if (!CLICKUP_API_TOKEN) {
    console.error('Error: CLICKUP_API_TOKEN environment variable is required');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const pageName = extractPageName(content, filePath);

  console.log(`Creating ClickUp page: ${pageName}`);

  try {
    const result = await createClickUpPage(pageName, content);
    console.log(`Successfully created page with ID: ${result.id}`);
    console.log(`Page URL: https://app.clickup.com/${CLICKUP_WORKSPACE_ID}/docs/${CLICKUP_DOC_ID}?block=${result.id}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
