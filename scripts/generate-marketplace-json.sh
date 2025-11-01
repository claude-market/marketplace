#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the repository root
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKETPLACE_JSON="$REPO_ROOT/.claude-plugin/marketplace.json"
TEMP_FILE=$(mktemp)

echo -e "${YELLOW}Generating marketplace.json from discovered plugins...${NC}"

# Calculate SHA256 of original file
ORIGINAL_SHA=$(shasum -a 256 "$MARKETPLACE_JSON" | awk '{print $1}')

# Extract the marketplace metadata (everything except plugins array)
MARKETPLACE_HEADER=$(jq 'del(.plugins)' "$MARKETPLACE_JSON")

# Find all plugin.json files (excluding the marketplace's own .claude-plugin)
PLUGIN_FILES=$(find "$REPO_ROOT" -name "plugin.json" -path "*/.claude-plugin/plugin.json" | \
    grep -v "^$REPO_ROOT/.claude-plugin/marketplace.json$" | \
    sort)

if [ -z "$PLUGIN_FILES" ]; then
    echo -e "${RED}No plugin.json files found!${NC}"
    exit 1
fi

echo -e "${GREEN}Found $(echo "$PLUGIN_FILES" | wc -l | tr -d ' ') plugin(s)${NC}"

# Start building the plugins array
PLUGINS_JSON="[]"

# Process each plugin.json file
while IFS= read -r plugin_file; do
    if [ ! -f "$plugin_file" ]; then
        continue
    fi

    echo "Processing: $plugin_file"

    # Get the plugin directory (parent of .claude-plugin)
    PLUGIN_DIR=$(dirname "$(dirname "$plugin_file")")

    # Calculate relative path from repo root
    RELATIVE_PATH=$(realpath --relative-to="$REPO_ROOT" "$PLUGIN_DIR" 2>/dev/null || \
                    python3 -c "import os.path; print(os.path.relpath('$PLUGIN_DIR', '$REPO_ROOT'))")
    SOURCE_PATH="./$RELATIVE_PATH"

    # Read the plugin.json
    PLUGIN_DATA=$(cat "$plugin_file")

    # Extract fields from plugin.json
    NAME=$(echo "$PLUGIN_DATA" | jq -r '.name // empty')
    VERSION=$(echo "$PLUGIN_DATA" | jq -r '.version // empty')
    DESCRIPTION=$(echo "$PLUGIN_DATA" | jq -r '.description // empty')
    AUTHOR=$(echo "$PLUGIN_DATA" | jq -r '.author // empty')
    LICENSE=$(echo "$PLUGIN_DATA" | jq -r '.license // empty')
    HOMEPAGE=$(echo "$PLUGIN_DATA" | jq -r '.homepage // empty')
    REPOSITORY=$(echo "$PLUGIN_DATA" | jq -r '.repository // empty')
    KEYWORDS=$(echo "$PLUGIN_DATA" | jq -c '.keywords // []')
    COMMANDS=$(echo "$PLUGIN_DATA" | jq -c '.commands // []')
    AGENTS=$(echo "$PLUGIN_DATA" | jq -c '.agents // []')
    HOOKS=$(echo "$PLUGIN_DATA" | jq -c '.hooks // []')
    MCP_SERVERS=$(echo "$PLUGIN_DATA" | jq -c '.mcpServers // []')
    SKILLS=$(echo "$PLUGIN_DATA" | jq -c '.skills // []')

    if [ -z "$NAME" ]; then
        echo -e "${RED}  Warning: Plugin at $plugin_file has no name, skipping${NC}"
        continue
    fi

    # Build the plugin entry
    PLUGIN_ENTRY=$(jq -n \
        --arg name "$NAME" \
        --arg source "$SOURCE_PATH" \
        --arg version "$VERSION" \
        --arg description "$DESCRIPTION" \
        --arg author "$AUTHOR" \
        --arg license "$LICENSE" \
        --arg homepage "$HOMEPAGE" \
        --arg repository "$REPOSITORY" \
        --argjson keywords "$KEYWORDS" \
        --argjson commands "$COMMANDS" \
        --argjson agents "$AGENTS" \
        --argjson hooks "$HOOKS" \
        --argjson mcpServers "$MCP_SERVERS" \
        --argjson skills "$SKILLS" \
        '{
            name: $name,
            source: $source
        } +
        (if $version != "" then {version: $version} else {} end) +
        (if $description != "" then {description: $description} else {} end) +
        (if $author != "" then {author: $author} else {} end) +
        (if $license != "" then {license: $license} else {} end) +
        (if $homepage != "" then {homepage: $homepage} else {} end) +
        (if $repository != "" then {repository: $repository} else {} end) +
        (if ($keywords | length) > 0 then {keywords: $keywords} else {} end) +
        (if ($commands | length) > 0 then {commands: $commands} else {} end) +
        (if ($agents | length) > 0 then {agents: $agents} else {} end) +
        (if ($hooks | length) > 0 then {hooks: $hooks} else {} end) +
        (if ($mcpServers | length) > 0 then {mcpServers: $mcpServers} else {} end) +
        (if ($skills | length) > 0 then {skills: $skills} else {} end)
    ')

    # Add to plugins array
    PLUGINS_JSON=$(echo "$PLUGINS_JSON" | jq --argjson entry "$PLUGIN_ENTRY" '. + [$entry]')

    echo -e "${GREEN}  Added: $NAME${NC}"
done <<< "$PLUGIN_FILES"

# Sort plugins alphabetically by name
PLUGINS_JSON=$(echo "$PLUGINS_JSON" | jq 'sort_by(.name)')

# Combine marketplace metadata with plugins array
FINAL_JSON=$(echo "$MARKETPLACE_HEADER" | jq --argjson plugins "$PLUGINS_JSON" '. + {plugins: $plugins}')

# Write to marketplace.json with proper formatting
echo "$FINAL_JSON" | jq '.' > "$TEMP_FILE"

# Calculate SHA256 of new file
NEW_SHA=$(shasum -a 256 "$TEMP_FILE" | awk '{print $1}')

# Check if content changed
if [ "$ORIGINAL_SHA" != "$NEW_SHA" ]; then
    echo -e "${YELLOW}Content changed, incrementing patch version...${NC}"

    # Extract current version
    CURRENT_VERSION=$(echo "$MARKETPLACE_HEADER" | jq -r '.version // "1.0.0"')

    # Parse version components (major.minor.patch)
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

    # Increment patch version
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}"

    echo -e "${GREEN}Version: $CURRENT_VERSION -> $NEW_VERSION${NC}"

    # Update the marketplace header with new version
    MARKETPLACE_HEADER=$(echo "$MARKETPLACE_HEADER" | jq --arg version "$NEW_VERSION" '.version = $version')

    # Regenerate with new version
    FINAL_JSON=$(echo "$MARKETPLACE_HEADER" | jq --argjson plugins "$PLUGINS_JSON" '. + {plugins: $plugins}')
    echo "$FINAL_JSON" | jq '.' > "$TEMP_FILE"
fi

# Replace the original file
mv "$TEMP_FILE" "$MARKETPLACE_JSON"

echo -e "${GREEN}Successfully updated $MARKETPLACE_JSON${NC}"
echo -e "${GREEN}Total plugins: $(echo "$PLUGINS_JSON" | jq 'length')${NC}"
