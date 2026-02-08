# ClickUp Release Notes Automation

Automatically create ClickUp docs from markdown release notes files.

## How It Works

1. Push a markdown file to the `release-notes/` folder
2. GitHub Actions automatically creates a new page in ClickUp under "Upcoming (Not Published)"
3. The page is created in the Gameball Product Release Notes doc

## Setup

### Required GitHub Secrets

Add these secrets to your repository (Settings > Secrets and variables > Actions):

| Secret | Value | Description |
|--------|-------|-------------|
| `CLICKUP_API_TOKEN` | `pk_5495653_...` | Your ClickUp API token |
| `CLICKUP_WORKSPACE_ID` | `3477524` | Gameball workspace ID |
| `CLICKUP_DOC_ID` | `3a40m-33560` | Gameball Product Release Notes doc ID |
| `CLICKUP_PARENT_PAGE_ID` | `3a40m-31220` | "Upcoming (Not Published)" page ID |

## Usage

### For Lovable

Push a markdown file to the `release-notes/` folder:

```
release-notes/
  └── release-notes-feb-2026.md
```

The file should follow this format:

```markdown
# What's New?

**Date:** 05 of February 2026 | **Release:** Q3-W1 | From 01 Feb, 26 to 05 Feb, 26 [1 Week]

---

## New Features

### 1. Feature Name

| | |
|---|---|
| **Platform** | Web |
| **Plan** | Shopify & Salla: Pro / GURU |
| **Channel** | All |

Feature description...

---

## Other Improvements

### 1. Improvement Name

Description...

---

## Bug Fixes

N/A

---

**That's all for today, See you in the next release note!**
```

### Manual Trigger

You can also manually trigger the workflow:
1. Go to Actions > Create ClickUp Release Notes
2. Click "Run workflow"
3. Enter the file path (e.g., `release-notes/my-release.md`)

## File Naming

The page name in ClickUp is automatically generated from the content:
- Format: `R{YY}.{Release}-{MMDD}`
- Example: `R26.049-0205` (Release 049 on Feb 05, 2026)

## Local Testing

```bash
export CLICKUP_API_TOKEN="your-token"
node scripts/create-clickup-doc.js release-notes/my-release.md
```
