# GitLab Publishing System - Setup Guide

This document explains the new GitLab-based publishing system that replaces the Wallo moderation webhook.

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
   - **Redirect URI**: `https://fuiz.org/api/git/callback?provider=gitlab` (or your domain)
   - **Scopes**: `api`, `write_repository`
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
GITLAB_REDIRECT_URI=https://fuiz.app/api/git/callback?provider=gitlab

# Git Repository Configuration
GIT_PROVIDER=gitlab
GIT_REPO_OWNER=fuiz-org
GIT_REPO_NAME=fuiz-library
GIT_DEFAULT_BRANCH=main

# Webhook Secret (generate a strong random string)
GIT_WEBHOOK_SECRET=<generate_random_secret>

# Bot Token (for sync operations)
GIT_BOT_TOKEN=<personal_access_token_with_api_scope>
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
   - **URL**: `https://fuiz.app/git-webhook`
   - **Secret Token**: Use the same value as `GIT_WEBHOOK_SECRET`
   - **Trigger**: Select "Push events"
   - **Branch filter**: Leave empty or specify your default branch (e.g., `main`)
   - **SSL verification**: Enable
3. Test the webhook

### 5. Database Setup

The new schema uses a simplified `fuizzes` table. Run the SQL from `src/schema.sql` to create:

- `fuizzes` - Published fuizzes with metadata
- `webhook_sync` - Idempotent webhook processing log

See `DATABASE_SCHEMA.md` for the complete schema documentation.

### 6. Remove Wallo Configuration

Remove these environment variables from production:

- `WALLO_CLIENT_ID`
- `WALLO_CLIENT_SECRET`
- `WALLO_ORIGIN`

## How It Works

### Publishing Flow

1. **User Authentication**
   - User navigates to `/publish`
   - If not authenticated with GitLab, they see a login button
   - Click "Login with GitLab" → OAuth flow → redirect back to publish page

2. **Submission**
   - User fills in metadata (author, subjects, grades, language)
   - Click "Request Publish"
   - System extracts all images from the fuiz config:
     - Base64 images → decoded to binary
     - Corkboard images → downloaded
     - URL images → downloaded
   - All images are hashed and stored as `{fuiz_id}/{hash}.{ext}`
   - TOML config is stored as `{fuiz_id}/config.toml` with relative image filenames
   - A new branch is created: `submission/{storage_id}`
   - Files are committed to the branch (all in the same directory)
   - A PR is created with metadata in the description
   - PR URL is stored in database and shown to user

3. **Review & Approval**
   - Maintainer reviews the PR on GitLab
   - Checks fuiz content, images, metadata
   - Merges PR if approved, or closes if rejected

4. **Webhook Processing**
   - GitLab sends push webhook when changes are pushed to default branch
   - Webhook handler validates secret
   - Extracts modified fuiz directories from commit file changes
   - Calls sync script for each modified fuiz

5. **Sync Script**
   - Fetches config.toml from Git repository
   - Parses TOML configuration
   - Downloads images from Git and converts to Base64
   - Stores processed config (with Base64 images) in R2 bucket
   - Generates thumbnail from Base64 images
   - Inserts into `fuizzes` table
   - Fuiz appears in public library

### Update Flow

Similar to publishing, but:

- Branch name: `update/{desired_id}/{storage_id}`
- PR title: `[Update] {fuiz.title}`
- Preserves existing play count and view count
- Replaces old fuiz in database

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

### Benefits of This Structure

1. **Easy to Browse**: Each fuiz is self-contained in one directory
2. **Clear Ownership**: All files for a fuiz are together
3. **Simple Cleanup**: Delete a directory to remove a fuiz
4. **Version Control**: Changes to a fuiz affect only its directory
5. **Relative Paths**: TOML just references filenames (e.g., `abc123def456.png`) not full paths

## File Structure

### New Files Created

```
src/lib/git/
├── types.ts          # Git provider type definitions
├── base.ts           # Abstract base class for Git clients
├── gitlab.ts         # GitLab API implementation
├── github.ts         # GitHub stub (future support)
└── factory.ts        # Provider factory

src/routes/api/git/
├── gitUtil.ts        # OAuth utilities
├── login/+server.ts  # OAuth initiation
├── callback/+server.ts # OAuth callback
├── status/+server.ts # Auth status check
└── logout/+server.ts # Clear tokens

src/routes/git-webhook/
└── +server.ts        # PR merge webhook handler

src/lib/scripts/
├── syncLibrary.ts    # Sync from Git to database
└── imageHandler.ts   # Image processing utilities
```

### Modified Files

```
src/routes/publish/+page.server.ts  # Publishing logic
src/routes/publish/Publish.svelte   # Publishing UI
src/schema.sql                       # Database schema
.env.local                           # Environment variables
```

### Deleted Files

```
src/routes/wallo/+server.ts         # Old Wallo webhook (removed)
```

## API Endpoints

### OAuth Endpoints

- `GET /api/git/login?provider=gitlab&return=/publish` - Initiate OAuth flow
- `GET /api/git/callback?provider=gitlab` - OAuth callback handler
- `GET /api/git/status` - Check authentication status
- `POST /api/git/logout` - Clear OAuth tokens

### Webhook Endpoint

- `POST /git-webhook` - GitLab push webhook handler (requires secret)
  - Listens for pushes to the default branch
  - Syncs any fuiz directories that were modified in the push

## Manual Sync

For initial bulk import or recovery, you can manually sync all fuizzes:

```typescript
import { syncAll } from '$lib/scripts/syncLibrary';

// In a server context with platform access
await syncAll(platform.env.BUCKET, platform.env.DATABASE, process.env.GIT_BOT_TOKEN);
```

## Security Considerations

1. **OAuth Tokens** - Stored in httpOnly cookies, never exposed to client
2. **Webhook Secret** - Validated using timing-safe comparison
3. **Bot Token** - Only used server-side, never sent to client
4. **Git Repo** - Can be private, authentication handled by bot token

## Troubleshooting

### PR not syncing after merge

1. Check webhook logs in GitLab (Settings > Webhooks > Edit > Recent Deliveries)
2. Check application logs for webhook processing errors
3. Verify `GIT_WEBHOOK_SECRET` matches in both places
4. Manually trigger sync via sync script

### Images not loading after sync

1. Verify `GIT_BOT_TOKEN` has correct permissions to read repository files
2. Review sync script logs for image download/conversion errors
3. Check that image files exist in the Git repository in the fuiz directory

### User can't login with GitLab

1. Verify `GITLAB_CLIENT_ID` and `GITLAB_CLIENT_SECRET` are correct
2. Check redirect URI matches exactly (including query params)
3. Ensure OAuth application has correct scopes
4. Check browser console for errors

## Future Enhancements

- GitHub support (stub already created in `src/lib/git/github.ts`)
- Admin dashboard for managing pending submissions
- Automated testing of fuiz submissions
- PR templates with checklists
- Automated image optimization
- Branch cleanup after merge

## Migration Notes

The new system uses a simplified database schema:

**Old tables (removed):**

- `approved_submissions`
- `pending_submissions`

**New tables:**

- `fuizzes` - Unified table for all published content
- `webhook_sync` - Webhook processing log

**Key changes:**

- Subjects/grades stored as JSON arrays instead of tilde-separated strings
- Keywords/tags should be generated during publish, not during sync
- Statistics: added `view_count`, kept `played_count`
- Git metadata: `git_commit_sha` and `git_pr_number` for traceability

## Support

For issues or questions, please file an issue on GitHub or contact the development team.
