# ClickUp Release Notes Automation

Automatically create ClickUp docs from release notes data.

## How It Works

1. Push a JSON file to the `release-data/` folder with your release notes data
2. GitHub Actions automatically formats it into markdown and creates a page in ClickUp
3. The page is created under "Gameball Product Release Notes > Upcoming (Not Published)"

## Usage

### Push JSON Data (Recommended)

Push a JSON file to `release-data/` folder:

```json
{
  "date": "15 of March 2026",
  "release": "051",
  "dateRange": "10 Mar, 26 to 15 Mar, 26",
  "duration": "1 Week",
  "newFeatures": [
    {
      "title": "Feature Name",
      "platform": "Web",
      "plan": "Shopify & Salla: Pro / GURU · Selfserve: Growth / Enterprise",
      "channel": "All",
      "description": "Brief description of the feature.",
      "capabilities": [
        {
          "title": "Dashboard Control",
          "items": [
            "New toggle in Settings",
            "Default set to Inactive"
          ]
        },
        {
          "title": "Configuration Options",
          "items": [
            "Define start date",
            "Control visibility"
          ]
        }
      ]
    }
  ],
  "improvements": [
    {
      "title": "Improvement Name",
      "overview": "Description of the improvement.",
      "endpoint": "GET /api/v4.0/example",
      "whatsNew": [
        {
          "title": "Enhanced Response",
          "items": [
            "New field added",
            "Better performance"
          ]
        }
      ]
    }
  ],
  "bugFixes": [
    "Fixed issue with X",
    "Resolved problem in Y"
  ]
}
```

### JSON Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | Format: "DD of Month YYYY" |
| `release` | string | Yes | Release number (e.g., "051") |
| `dateRange` | string | Yes | Date range (e.g., "10 Mar, 26 to 15 Mar, 26") |
| `duration` | string | Yes | Duration (e.g., "1 Week") |
| `newFeatures` | array | No | List of new features |
| `improvements` | array | No | List of improvements |
| `bugFixes` | array | No | List of bug fixes (strings or objects) |

### Feature Object

```json
{
  "title": "Feature Name",
  "platform": "Web / API / Mobile",
  "plan": "Plan details",
  "channel": "All",
  "description": "Feature description",
  "overview": "Optional overview section",
  "capabilities": [
    {
      "title": "Capability Group",
      "items": ["Item 1", "Item 2"]
    }
  ],
  "whatsNew": [
    {
      "title": "What's New Item",
      "description": "Optional description",
      "items": ["Detail 1", "Detail 2"]
    }
  ]
}
```

### Alternative: Push Markdown Directly

You can also push pre-formatted markdown to `release-notes/` folder.

## File Naming

- JSON files: `release-data/release-YYYY-MM-DD.json`
- Markdown files: `release-notes/release-notes-month-year.md`

The page name in ClickUp is automatically generated: `R{YY}.{Release}-{MMDD}`

## Setup (Already Configured)

GitHub Secrets:
- `CLICKUP_API_TOKEN`
- `CLICKUP_WORKSPACE_ID`
- `CLICKUP_DOC_ID`
- `CLICKUP_PARENT_PAGE_ID`
