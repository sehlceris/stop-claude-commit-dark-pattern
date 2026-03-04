# @sehlceris/stop-claude-commit-dark-pattern

Remove Claude Code's co-author attribution from git commits and PR descriptions.

Claude Code adds a `Co-Authored-By: Claude...` line to every git commit and an AI attribution footer to PR descriptions by default. This tool sets empty attribution strings in your Claude Code settings to disable that behavior.

## Usage

```bash
npx @sehlceris/stop-claude-commit-dark-pattern
```

Or install globally:

```bash
npm i -g @sehlceris/stop-claude-commit-dark-pattern
stop-claude-commit-dark-pattern
```

An interactive checkbox menu lets you pick which settings files to update:

- **Global user settings** (`~/.claude/settings.json`) - checked by default, created if missing
- **Project-wide settings** (`.claude/settings.json`) - checked by default only if it already exists
- **Local project override** (`.claude/settings.local.json`) - checked by default only if it already exists

Use arrow keys to navigate, space to toggle, enter to apply.

## What it does

Adds this to your Claude Code settings:

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

Existing settings in each file are preserved; only the `attribution` key is added or overwritten.

## Manually disabling Claude Code attribution (without this tool)

If you'd rather not install anything, just add the following JSON to one or more of your Claude Code settings files:

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

This tells Claude Code not to include any attribution text in:

- **Git commits** (no "Co-Authored-By: Claude..." line)
- **Pull request descriptions** (no AI attribution footer)

### Settings file locations

Claude Code supports multiple settings files. Add the JSON above to any of these:

| File                          | Scope                  | Notes                                                 |
| ----------------------------- | ---------------------- | ----------------------------------------------------- |
| `~/.claude/settings.json`     | Global (all projects)  | `%USERPROFILE%\.claude\settings.json` on Windows      |
| `.claude/settings.json`       | Project-wide           | Checked into version control, shared with your team   |
| `.claude/settings.local.json` | Local project override | Typically gitignored, applies only to your local copy |

If the file already exists, merge the `"attribution"` key into the existing JSON. If it doesn't exist, create it with the JSON above.

## Platform support

Works on macOS, Linux, and Windows. On Windows the global settings path resolves to `%USERPROFILE%\.claude\settings.json`.

## Publishing to npm

- Create an account at https://www.npmjs.com/
- Create an organization (NOTE: you will be asked to choose a different username, since usernames cannot be named the same as organizations)

```bash
# Log in to npm (one-time)
npm login

# Scoped packages are private by default — use --access public
npm publish --access public
```

To publish a new version later, bump the version first:

```bash
npm version patch   # or minor / major
npm publish --access public
```

## License

MIT
