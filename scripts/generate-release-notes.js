const fs = require('fs');
const path = require('path');

/**
 * Generates formatted release notes markdown from JSON data
 */
function generateReleaseNotes(data) {
  const {
    date,
    release,
    dateRange,
    duration,
    newFeatures = [],
    improvements = [],
    bugFixes = []
  } = data;

  let markdown = `# What's New?\n\n`;
  markdown += `**Date:** ${date} | **Release:** ${release} | From ${dateRange} [${duration}]\n\n`;
  markdown += `---\n\n`;

  // New Features
  if (newFeatures.length > 0) {
    markdown += `## New Features\n\n`;

    newFeatures.forEach((feature, index) => {
      markdown += `### ${index + 1}. ${feature.title}\n\n`;

      // Platform/Plan/Channel table
      markdown += `| | |\n|---|---|\n`;
      markdown += `| **Platform** | ${feature.platform || 'Web'} |\n`;
      markdown += `| **Plan** | ${feature.plan || 'All Plans'} |\n`;
      markdown += `| **Channel** | ${feature.channel || 'All'} |\n\n`;

      // Description
      if (feature.description) {
        markdown += `${feature.description}\n\n`;
      }

      // Overview (if provided)
      if (feature.overview) {
        markdown += `#### Overview\n\n${feature.overview}\n\n`;
      }

      // Key Capabilities
      if (feature.capabilities && feature.capabilities.length > 0) {
        markdown += `#### Key Capabilities\n\n`;

        feature.capabilities.forEach(capability => {
          if (typeof capability === 'string') {
            markdown += `- ${capability}\n`;
          } else if (capability.title) {
            markdown += `**${capability.title}**\n`;
            if (capability.items && capability.items.length > 0) {
              capability.items.forEach(item => {
                markdown += `- ${item}\n`;
              });
            }
            markdown += `\n`;
          }
        });
        markdown += `\n`;
      }

      // What's New section (alternative to capabilities)
      if (feature.whatsNew && feature.whatsNew.length > 0) {
        markdown += `#### What's New\n\n`;

        feature.whatsNew.forEach((item, i) => {
          markdown += `**${i + 1}. ${item.title}**\n\n`;
          if (item.description) {
            markdown += `${item.description}\n`;
          }
          if (item.items && item.items.length > 0) {
            item.items.forEach(subItem => {
              markdown += `- ${subItem}\n`;
            });
          }
          markdown += `\n`;
        });
      }

      markdown += `---\n\n`;
    });
  }

  // Other Improvements
  if (improvements.length > 0) {
    markdown += `## Other Improvements\n\n`;

    improvements.forEach((improvement, index) => {
      markdown += `### ${index + 1}. ${improvement.title}\n\n`;

      if (improvement.overview) {
        markdown += `#### Overview\n\n${improvement.overview}\n\n`;
      }

      if (improvement.description) {
        markdown += `${improvement.description}\n\n`;
      }

      if (improvement.endpoint) {
        markdown += `**Endpoint:** ${improvement.endpoint}\n\n`;
      }

      if (improvement.whatsNew && improvement.whatsNew.length > 0) {
        markdown += `#### What's New\n\n`;

        improvement.whatsNew.forEach((item, i) => {
          markdown += `**${i + 1}. ${item.title}**\n\n`;
          if (item.description) {
            markdown += `${item.description}\n`;
          }
          if (item.items && item.items.length > 0) {
            item.items.forEach(subItem => {
              markdown += `- ${subItem}\n`;
            });
          }
          markdown += `\n`;
        });
      }

      if (improvement.details && improvement.details.length > 0) {
        improvement.details.forEach((detail, i) => {
          markdown += `**${i + 1}. ${detail.title}**\n\n`;
          if (detail.description) {
            markdown += `${detail.description}\n\n`;
          }
        });
      }

      markdown += `---\n\n`;
    });
  }

  // Bug Fixes
  markdown += `## Bug Fixes\n\n`;

  if (bugFixes.length > 0) {
    bugFixes.forEach(bug => {
      if (typeof bug === 'string') {
        markdown += `- ${bug}\n`;
      } else if (bug.title) {
        markdown += `- **${bug.title}**: ${bug.description || ''}\n`;
      }
    });
  } else {
    markdown += `N/A\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `**That's all for today, See you in the next release note!**`;

  return markdown;
}

/**
 * Extract page name from data
 */
function extractPageName(data) {
  const { date, release } = data;

  // Try to parse date like "05 of February 2026"
  const dateMatch = date.match(/(\d+)\s*of\s*(\w+)\s*(\d+)/i);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const monthName = dateMatch[2].toLowerCase();
    const year = dateMatch[3].substring(2);

    const months = {
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };

    const month = months[monthName] || '01';
    const releaseNum = release.replace(/[^0-9]/g, '').padStart(3, '0');

    return `R${year}.${releaseNum}-${month}${day}`;
  }

  // Fallback
  return `Release-${release}`;
}

// Main execution
async function main() {
  const filePath = process.argv[2];
  const outputPath = process.argv[3];

  if (!filePath) {
    console.error('Usage: node generate-release-notes.js <input.json> [output.md]');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const jsonContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(jsonContent);

    const markdown = generateReleaseNotes(data);
    const pageName = extractPageName(data);

    if (outputPath) {
      fs.writeFileSync(outputPath, markdown);
      console.log(`Generated: ${outputPath}`);
    } else {
      // Output to stdout
      console.log(markdown);
    }

    // Output page name to stderr for the workflow to capture
    console.error(`PAGE_NAME=${pageName}`);

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
