---
title: View Version Details
summary: To view version details for a specific cockroach binary, run the cockroach version command.
toc: false
---

To view version details for a specific `cockroach` binary, run the `cockroach version` [command](cockroach-commands.html):

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach version
~~~

~~~
Build Tag:   {{page.release_info.version}}
Build Time:  {{page.release_info.build_time}}
Distribution: CCL
Platform:     darwin amd64
Go Version:   go1.8.3
C Compiler:   4.2.1 Compatible Clang 3.8.0 (tags/RELEASE_380/final)
Build SHA-1:  5b757262d33d814bda1deb2af20161a1f7749df3
Build Type:   release
~~~

The `cockroach version` command outputs the following fields:

Field | Description
------|------------
`Build Tag` | The CockroachDB version.
`Build Time` | The date and time when the binary was built.
`Distribution` | The scope of the binary. If `CCL`, the binary contains open-source and enterprise functionality covered by the CockroachDB Community License. If `OSS`, the binary contains only open-source functionality.<br><br>To obtain a pure open-source binary, you must [build from source](install-cockroachdb.html) using the `make buildoss` command.
`Platform` | The platform that the binary can run on.
`Go Version` | The version of Go in which the source code is written.
`C Compiler` | The C compiler used to build the binary.
`Build SHA-1` | The SHA-1 hash of the commit used to build the binary.
`Build Type` | The type of release. If `release`, `release-gnu`, or `release-musl`, the binary is for a [production release](../releases/#production-releases). If `development`, the binary is for a [testing release](../releases/#testing-releases).

## See Also

- [Install CockroachDB](install-cockroachdb.html)
- [Other Cockroach Commands](cockroach-commands.html)
