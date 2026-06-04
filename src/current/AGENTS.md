# AGENTS.md for CockroachDB docs

Hello! We're working together on docs for CockroachDB, a distributed SQL database. The docs are located in Markdown files (with Liquid templates) in various subdirectories of this one.

This file has instructions and general info for working with us on these docs. Please pay close attention to things written here.

Docs for each released version are in subdirectories named for the version, e.g., `v25.4`.

Docs specific to the CockroachDB Cloud product are in `cockroachcloud`.

Docs related to release notes and other release-related matters are in `releases`.

## Style guide

Our style guide lives in `StyleGuide.md` in the root of this repository. Please follow the guidance there carefully when writing docs.

## Include files

To avoid repeating text across different files, we use shared "include files" (or just: "includes") which are referenced using the following syntax.

For includes that apply across versions or products:

```
{% include common/define-watched-cdc.md %}
```

For includes that pertain to the CockroachDB Cloud product:

```
{% include cockroachcloud/metrics-time-interval-selection.md %}
```

For includes that we can assume only apply to specific versions, though in some cases, their content may be identical across all versions where the file exists:

```
{% include vXX.Y/misc/cert-auth-using-x509-subject.md %}
```

Note: The Liquid variable `{{page.version.version}}` resolves to the major version in the path of the page where it is used (e.g. `v25.4`). References to version-specific includes often use this, allowing the same page content that's used across versions to show different versions of an include, based on the current version being rendered. For example, `{% include {{page.version.version}}/misc/cert-auth-using-x509-subject.md %}`.
  
The includes are all located in subdirectories of the `_includes` directory (relative to `src/current`), i.e.,

- `_includes/common` for widely shared things
- `_includes/cockroachcloud` for Cloud
- `_includes/v25.4` for v25.4-specific content

When reviewing documentation pages, make sure to read and follow all included files to get the complete picture of what users see

<!-- eof -->
