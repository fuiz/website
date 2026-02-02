# GitLab Publishing System - Setup Guide

This document explains the GitLab-based publishing system.

## Overview

The new system uses GitLab OAuth + Pull Requests for fuiz moderation. When users publish a fuiz:

1. They authenticate with GitLab
2. The system creates a PR to a configured repository containing the fuiz TOML and images
3. Maintainers review and merge the PR
4. A webhook triggers the sync script to load the fuiz into the database

## Setup Instructions

### 1. Create GitLab OAuth Application

1. Go to https://gitlab.com/-/profile/applications
2. Create a new application with:
   - **Name**: Fuiz Publishing
   - **Redirect URI**: `https://fuiz.org/api/git/callback` (or your domain)
   - **Scopes**: `api`
3. Copy the Application ID and Secret

### 2. Create GitLab Repository

1. Create a new GitLab repository (e.g., `fuiz/library`)
2. Create an initial README.md file
3. Set up branch protection for `main` branch to require PR reviews

**Note**: The repository will be organized with each fuiz in its own directory:

```
{fuiz_id}/
  config.toml
  {image_hash}.{ext}
  {image_hash}.{ext}
  ...
```

### 3. Configure Environment Variables

Update your production environment with these variables:

```bash
# GitLab OAuth
GITLAB_CLIENT_ID=your_gitlab_application_id
GITLAB_CLIENT_SECRET=your_gitlab_application_secret
GITLAB_REDIRECT_URI=https://fuiz.app/api/git/callback

# Git Repository Configuration
GIT_PROVIDER=gitlab
GIT_REPO_OWNER=fuiz-org
GIT_REPO_NAME=fuiz-library
GIT_DEFAULT_BRANCH=main

# Webhook Secret (generate a strong random string)
GIT_WEBHOOK_SECRET=<generate_random_secret>

# Bot Token (for sync operations - needs read_repository scope)
GIT_BOT_TOKEN=<personal_access_token_with_api_scope>

# Note: Cloudflare Workers will need these Bindings configured:
# - BUCKET (R2 bucket for storing fuiz JSON with Base64 images)
# - DATABASE (D1 database for fuizzes metadata table)
# - PUBLISH_JOBS (KV namespace for temporary job storage)
# - AI (Cloudflare AI binding for keyword generation)
```

To generate `GIT_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
```

To create `GIT_BOT_TOKEN`:

1. Go to https://gitlab.com/-/profile/personal_access_tokens
2. Create a token with `api` scope
3. Copy and store securely

### 4. Configure GitLab Webhook

1. Go to your repository: Settings > Webhooks
2. Add a new webhook:
   - **URL**: `https://fuiz.org/api/library/git-webhook`
   - **Secret Token**: Use the same value as `GIT_WEBHOOK_SECRET`
   - **Trigger**: Select "Push events"
   - **Branch filter**: Leave empty or specify your default branch (e.g., `main`)
   - **SSL verification**: Enable
3. Test the webhook

### 5. Database Setup

The schema uses one table. Run the SQL from `src/schema.sql` to create:

- `fuizzes` - Published fuizzes with metadata

## How It Works

### Publishing Flow

1. **User Authentication**
   - User navigates to `/publish?id={creation_id}`
   - If not authenticated with GitLab, they see a login prompt with a styled button
   - Click "Connect GitLab Account" → OAuth flow → redirect back to publish page

2. **Submission** (Two-Step Process)

   **Step 1: Initialize Job** (`POST /api/library/publish-init`)
   - User fills in metadata (author, subjects, grades, language)
   - Clicks "Request Publish" button
   - System validates GitLab authentication
   - Generates a unique job ID (UUID)
   - Stores fuiz data in KV store (PUBLISH_JOBS) with 10-minute expiration
   - Returns job ID to client

   **Step 2: Stream Publishing** (`GET /api/library/publish-stream?job={jobId}`)
   - Client connects to SSE endpoint with job ID
   - Server retrieves fuiz data from KV and deletes job entry
   - Publishing process streams progress updates:

     a. **Generating Keywords** - Uses Cloudflare AI to generate 16 search keywords from slide titles

     b. **Forking Repository** - Forks the target GitLab repository to user's account (if not already forked)

     c. **Creating Branch** - Creates new branch `submission/{fuiz_id}` where fuiz_id is a generated UUID

     d. **Uploading Files** - Processes and uploads all files:
     - Extracts images from slides (Base64, Corkboard, URLs)
     - Hashes each image and names as `{fuiz_id}/{hash}.{ext}`
     - Converts fuiz config to TOML with relative image paths
     - Creates `{fuiz_id}/config.toml`
     - Commits all files in single commit: "Add fuiz: {title} ({count} files)"

     e. **Creating Pull Request** - Creates PR with:
     - Title: `[Submission] {fuiz.title}`
     - Target: default branch (main)
     - Body: Formatted markdown with title, author, language, subjects, grades, slide count, fuiz ID, image count
     - Returns PR URL to user

3. **Review & Approval**
   - Maintainer reviews the PR on GitLab
   - Checks fuiz content quality, images, metadata accuracy
   - Reviews generated keywords
   - Merges PR if approved (triggers webhook), or closes if rejected

4. **Webhook Processing** (`POST /api/library/git-webhook`)
   - GitLab sends push webhook when PR is merged to default branch
   - Webhook handler performs security validation:
     - Verifies `X-Gitlab-Token` header matches `GIT_WEBHOOK_SECRET` using timing-safe comparison
     - Only processes `push` events
     - Only processes pushes to default branch (`refs/heads/main`)
   - Extracts all modified files from all commits in the push
   - Identifies unique fuiz directories (e.g., files like `abc-123/config.toml` → directory `abc-123`)
   - For each modified fuiz directory:
     - Determines first and last commit dates that touched the directory
     - Gets the last commit SHA
     - Calls `syncSingleFuiz()` with fuiz ID, commit info, and timestamps
   - Returns JSON response with sync results for each fuiz

5. **Sync Script** (`syncSingleFuiz()`)
   - Uses bot token (GIT_BOT_TOKEN) to authenticate with GitLab API
   - Fetches `{fuiz_id}/config.toml` from Git repository at specific commit SHA
   - If config not found, deletes fuiz from database and R2 (handles deletions)
   - Checks if fuiz already exists in database:
     - **New fuiz**: Uses firstCommitDate from webhook as published_at
     - **Update**: Preserves played_count, view_count, and original published_at
   - Parses TOML configuration
   - Downloads all referenced images from Git repository
   - Converts images to Base64 format
   - Generates thumbnail from first available image
   - Creates FullOnlineFuiz object with processed config and metadata
   - Stores complete fuiz JSON (with Base64 images) in R2 bucket at key `{fuiz_id}`
   - Inserts/updates row in `fuizzes` table with:
     - Metadata (id, storage_id, title, author, language)
     - JSON arrays (subjects, grades, keywords)
     - Statistics (slides_count, played_count, view_count)
     - Thumbnail data (thumbnail, thumbnail_alt)
     - Git info (git_commit_sha)
     - Timestamps (published_at, updated_at)
   - Fuiz appears in public library immediately

### Update Flow

Updates to existing fuizzes are done **manually** on the Git repository:

- Maintainers directly edit files in the `{fuiz_id}/` directory on the repository
- Can update `config.toml` or replace image files
- Changes are committed directly to the default branch (or via manual PR)
- Webhook triggers sync automatically when changes are pushed to default branch
- On sync, system detects existing fuiz in database by ID
- Preserves statistics: played_count, view_count, and original published_at timestamp
- Updates updated_at to last commit timestamp
- Replaces config in R2 bucket and updates database row

**Note:** There is no automated update flow through the publishing UI. Users cannot update their own fuizzes after initial submission.

## Git Repository Structure

Each fuiz is stored in its own directory with all related files together:

```
{uuid1}/
  config.toml           # Fuiz configuration
  abc123def456.png      # Image file
  789fedcba321.jpg      # Another image

{uuid2}/
  config.toml
  image1hash.webp
  image2hash.png

README.md               # Repository documentation
```

## API Endpoints

### OAuth Endpoints

- `GET /api/git/login?provider=gitlab&return=/publish?id={id}` - Initiate OAuth flow
  - Redirects to GitLab OAuth authorization
  - Return URL specified for redirect after auth
- `GET /api/git/callback` - OAuth callback handler
  - Receives OAuth code and exchanges for tokens
  - Stores tokens in httpOnly cookies
  - Redirects to return URL
- `GET /api/git/status` - Check authentication status
  - Returns: `{ authenticated: boolean, provider: string | null, user?: { username, name } }`
- `POST /api/git/logout` - Clear OAuth tokens from cookies

### Publishing Endpoints

- `POST /api/library/publish-init` - Initialize publish job (Step 1)
  - Body: `{ fuiz: FullOnlineFuiz }`
  - Validates GitLab authentication
  - Creates job ID and stores in KV (10-minute expiration)
  - Returns: `{ jobId: string }`

- `GET /api/library/publish-stream?job={jobId}` - Stream publishing progress (Step 2)
  - Server-Sent Events endpoint
  - Events: `progress`, `complete`, `error`
  - Progress states: `generating-keywords`, `forking`, `creating-branch`, `uploading`, `creating-pr`
  - Complete event returns: `{ pr_url: string }`

### Webhook Endpoint

- `POST /api/library/git-webhook` - GitLab push webhook handler (requires secret)
  - Header: `X-Gitlab-Token: {GIT_WEBHOOK_SECRET}`
  - Only processes push events to default branch
  - Extracts modified fuiz directories from commit file changes
  - Syncs each modified fuiz with commit info (SHA, timestamps)
  - Returns: `{ success: boolean, message: string, results: Array<{fuizId, success, error?}> }`

## Manual Sync

For initial bulk import, recovery, or forcing a full resync of all fuizzes, you can trigger a manual sync using the API endpoint:

### Trigger Manual Sync

**Endpoint**: `POST /api/library/manual-sync`

**Authentication**: Pass `GIT_WEBHOOK_SECRET` in the Authorization header as a Bearer token

**Example**:

```bash
curl -X POST https://fuiz.org/api/library/manual-sync \
  -H "Authorization: Bearer YOUR_GIT_WEBHOOK_SECRET"
```

**How it works**:

- Fetches all directories in the Git repository
- For each directory with a `config.toml` file:
  - Checks if the fuiz exists in the database and compares commit SHAs
  - Skips if already up to date
  - For updates: preserves `played_count`, `view_count`, and `published_at`
  - For new fuizzes: uses the first commit date as `published_at`
  - Downloads all images, generates thumbnail, and stores in R2 bucket
  - Inserts/updates the database record
- Returns JSON response with success status

**Response**:

```json
{
	"success": true,
	"message": "Successfully synced all fuizzes"
}
```
