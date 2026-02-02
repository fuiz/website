-- ============================================================================
-- Fuiz Library Database Schema
-- ============================================================================
--
-- DESIGN PHILOSOPHY
-- -----------------
-- Git is the Source of Truth:
--   - Submissions = Pull Requests (tracked in GitLab/GitHub)
--   - Reviews/Comments = PR comments
--   - Approvals = PR merges
--   - Version History = Git history
--
-- Database is a Read-Optimized Cache:
--   - Stores only published fuizzes for fast library queries
--   - Metadata extracted from TOML files
--   - Statistics tracked for sorting/ranking
--   - Webhooks keep it in sync with Git
--
-- PUBLISHING FLOW
-- ---------------
-- 1. User creates fuiz in app
-- 2. User clicks "Publish" and authenticates with GitLab/GitHub
-- 3. App creates PR with TOML + images to upstream repo
-- 4. Maintainer reviews and merges PR
-- 5. Webhook triggers sync script:
--    - Fetches processed config from R2
--    - Downloads images from Git, uploads to Corkboard
--    - Generates thumbnail
--    - Inserts into fuizzes table
-- 6. Fuiz appears in public library
--
-- UPDATE FLOW
-- -----------
-- Same as publish, but preserves play_count and view_count
--
-- REPOSITORY STRUCTURE
-- --------------------
-- Each fuiz is stored in its own directory:
--   {uuid1}/
--     config.toml
--     abc123def456.png
--     789fedcba321.jpg
--   {uuid2}/
--     config.toml
--     image1hash.webp
--
-- ============================================================================

-- ============================================================================
-- PUBLISHED FUIZZES
-- ============================================================================
-- The public library of approved fuizzes
--
-- Indexes:
--   - language: Filter by language
--   - published_at DESC: Recent additions
--   - played_count DESC: Popular fuizzes
--   - updated_at DESC: Recently updated
-- ============================================================================
CREATE TABLE IF NOT EXISTS "fuizzes" (
    "id" text NOT NULL,                          -- Fuiz ID (same as directory name in Git)
    "storage_id" text NOT NULL,                  -- R2 bucket key for raw TOML content

    -- Metadata
    "title" text NOT NULL,
    "author" text NOT NULL,
    "language" text NOT NULL,
    "subjects" text DEFAULT NULL,                -- JSON array: ["math", "science"]
    "grades" text DEFAULT NULL,                  -- JSON array: ["K-2", "3-5"]
    "keywords" text DEFAULT NULL,                -- JSON array: ["educational", "interactive"]
    "slides_count" integer NOT NULL,
    "thumbnail" BLOB DEFAULT NULL,
    "thumbnail_alt" text DEFAULT NULL,

    -- Git reference (for updates/rollbacks)
    "git_commit_sha" text DEFAULT NULL,

    -- Statistics
    "played_count" integer NOT NULL DEFAULT 0,
    "view_count" integer NOT NULL DEFAULT 0,

    -- Timestamps
    "published_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE(storage_id)
);

CREATE INDEX IF NOT EXISTS "fuizzes_language" ON "fuizzes" ("language");
CREATE INDEX IF NOT EXISTS "fuizzes_published" ON "fuizzes" ("published_at" DESC);
CREATE INDEX IF NOT EXISTS "fuizzes_played" ON "fuizzes" ("played_count" DESC);
CREATE INDEX IF NOT EXISTS "fuizzes_updated" ON "fuizzes" ("updated_at" DESC);
