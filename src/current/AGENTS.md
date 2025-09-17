# AGENTS.md for CockroachDB docs

Hello! We're working together on docs for CockroachDB, a distributed SQL database. The docs are located in Markdown files (with Liquid templates) in various subdirectories of this one.

This file has instructions & general info for working with us on these docs. Please pay close attention to things written here.

Docs for each released version are in subdirectories named for the version, e.g., `v25.4`.

Docs for the Cockroach Cloud hosted version are in `cockroachcloud`.

Docs related to release notes and other release-related matters are in `releases`.

## Style guide

Our style guide lives in `StyleGuide.md` in the root of this repository. Please follow the guidance there carefully when writing docs.

## Include files

To avoid repeating text across different files, we use shared "include files" (or just: "includes") which are referenced using the following syntax.

For includes that are shared in many places:

```
{% include common/define-watched-cdc.md %}
```

For includes that are used in the Cloud product:

```
{% include cockroachcloud/metrics-time-interval-selection.md %}
```

For includes that are used in a specific version:

```
{% include {{page.version.version}}/misc/cert-auth-using-x509-subject.md %}
```

The includes are all located in subdirectories of the `_include` directory, i.e.,

- `_include/common` for widely shared things
- `_include/cockroachcloud` for Cloud
- `_include/v25.4` for v25.4 docs

<!-- eof -->
