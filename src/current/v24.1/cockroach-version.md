---
title: cockroach version
summary: To view version details for a specific cockroach binary, run the cockroach version command.
toc: true
key: view-version-details.html
docs_area: reference.cli
---

To view version details for a specific `cockroach` binary, run the `cockroach version` [command]({% link {{ page.version.version }}/cockroach-commands.md %}), or run `cockroach --version`:

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach version
~~~

~~~
Build Tag:        {{page.release_info.version}}
Build Time:       {{page.release_info.build_time}}
Distribution:     CCL
Platform:         darwin amd64 (x86_64-apple-darwin19)
Go Version:       go1.15.11
C Compiler:       Clang 10.0.0
Build Commit ID:  ac916850f403f083ea62e2b0dfdfecbbeaaa4d05
Build Type:       release
~~~

## Response

The `cockroach version` command outputs the following fields:

Field | Description
------|------------
`Build Tag` | The CockroachDB version.<br><br> To return just the build tag, use `cockroach version --build-tag`.
`Build Time` | The date and time when the binary was built.
`Distribution` | The scope of the binary. If `CCL`, the binary contains functionality covered by both the CockroachDB Community License (CCL) and the Business Source License (BSL). If `OSS`, the binary contains only functionality covered by the Apache 2.0 license. The v19.2 release converts to Apache 2.0 as of Oct 1, 2022, at which time you can use the `make buildoss` command to build a pure open-source binary. For more details about licensing, see the [Licensing FAQs]({% link {{ page.version.version }}/licensing-faqs.md %}).
`Platform` | The platform that the binary can run on.
`Go Version` | The version of Go in which the source code is written.
`C Compiler` | The C compiler used to build the binary.
`Build Commit ID` | The SHA-1 hash of the commit used to build the binary.
`Build Type` | The type of release. If `release`, `release-gnu`, or `release-musl`, the binary is for a production [release](../releases/). If `development`, the binary is for a testing release.

## See also

- [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
