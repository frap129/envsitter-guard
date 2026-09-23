# Changelog

## 1.0.0

### Changed

- Migrated to the OpenCode V2 plugin API (`@opencode/plugin`). OpenCode V1 is no longer supported.
- Plugin entrypoint is now `Plugin.define({ id, setup })`; tools register via `ctx.tool.transform`, the guard via `ctx.tool.hook("execute.before")`.
- Local plugin file moved from `.opencode/plugin/` to `.opencode/plugins/`.
- `opencode.json` uses the `plugins` key (was `plugin`).

### Added

- `grep` calls targeting sensitive `.env*` files (via `path` or `include`) are now blocked; V2 grep returns line previews which would leak values.

### Removed

- V1-only `multiedit` blocking (V2 has no such tool).

## 0.0.4

### Added

- `envsitter_add`: add a new key to a dotenv file (fails if key exists; dry-run unless `write: true`).
- `envsitter_set`: set a key's value (creates or updates; dry-run unless `write: true`).
- `envsitter_unset`: unset a key's value to empty string (keeps the key; dry-run unless `write: true`).
- `envsitter_delete`: delete key(s) from a dotenv file entirely (dry-run unless `write: true`).
- `envsitter_help`: comprehensive help tool explaining all EnvSitter tools to agents. Supports topics: `overview`, `reading`, `matching`, `mutations`, `file_ops`, `all`.

### Changed

- Blocking behavior is now silent (error message only, no toast notifications).
- Improved error messages to reference `envsitter_help` for guidance.
- Bumped `envsitter` dependency to `^0.0.4`.

## 0.0.3

### Added

- `envsitter_validate`: validate dotenv syntax (issues only; never values).
- `envsitter_copy`: copy keys between dotenv files (dry-run unless `write: true`; never values).
- `envsitter_format` / `envsitter_reorder`: format/reorder dotenv files (dry-run unless `write: true`; never values).
- `envsitter_annotate`: annotate dotenv keys with comments (dry-run unless `write: true`; never values).

### Changed

- `envsitter_match`: uses EnvSitter outside-in matching for `op: "is_equal"`.
- Block warnings: removed prompt append (toast-only) to avoid writing into OpenCode's input.
- Bumped `envsitter` dependency to `^0.0.3`.

## 0.0.2

### Added

- `envsitter_match`: safe boolean matching for `.env` keys (single key, bulk keys, or all keys) with support for the EnvSitter match operators.
- `envsitter_match_by_key`: safe candidates-by-key matching (returns booleans only).
- `envsitter_scan`: safe shape scanning (`jwt`, `url`, `base64`) without returning values.
- `envsitter_keys.filterRegex`: optional regex filter for key listing.

### Changed

- Bumped `envsitter` dependency to `^0.0.2`.
