---
title: Programmability of command-line interfaces
summary: Which command-line utilities are programmable and forward compatibility guarantees.
toc: true
---

The `cockroach` executable program provides many [sub-commands that
provide a command-line interface](cockroach-commands.html). Their
forward compatibility guarantees are listed below.

## Guarantees common to all sub-commands

| General behavior                                     | Status                        |
|------------------------------------------------------|-------------------------------|
| Output of `--help` or `help`                         | [public and non-programmable] |
| Output on `stderr`                                   | [public and non-programmable] |
| Exit status                                          | [public and programmable]     |
| Logging output, prefix before log messages           | [public and programmable]     |
| Logging output, content of log messages after prefix | [public and non-programmable] |

## Guarantees per command

| Command and behavior                                                                                      | Status                                                  |
|-----------------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `cockroach cert`, input format                                                                            | [public and programmable]                               |
| `cockroach cert`, output on stdout/stderr                                                                 | [public and non-programmable]                           |
| `cockroach cert`, output files                                                                            | [public and programmable], see note 2 below             |
| `cockroach debug`, input/output                                                                           | [reserved]                                              |
| `cockroach init`, input/output                                                                            | [public and programmable]                               |
| `cockroach node`, input/output                                                                            | [public and programmable], see note 2 below             |
| `cockroach quit`, input/output                                                                            | [public and programmable]                               |
| `cockroach start`/`start-single-node`, input format                                                       | [public and programmable]                               |
| `cockroach start`/`start-single-node`, status variables displayed when server ready                       | [public and programmable], see note 2 below             |
| `cockroach start`/`start-single-node`, informative and warning messages                                   | [public and non-programmable]                           |
| `cockroach start`/`start-single-node`, location of data and log files                                     | [public and programmable]                               |
| `cockroach start`/`start-single-node`, content of data files                                              | [public and non-programmable]                           |
| `cockroach user` (deprecated), input/output                                                               | [public and programmable], see note 2 below             |
| `cockroach version`, input/output                                                                         | [public and programmable], see note 2 below             |
| [`cockroach demo`], input/output                                                                          | [public and non-programmable]                           |
| [`cockroach sql`] input/output when ran interactively                                                     | [public and non-programmable]                           |
| [`cockroach sql`] non-interactive, SQL and `\cmd` inputs                                                  | [public and programmable], see note 2 below             |
| [`cockroach sql`] non-interactive, SQL result output, format `raw`, `csv` or `tsv`                        | [public and programmable], see note 2 below             |
| [`cockroach sql`] non-interactive, SQL result output, other display formats (`html`, `sql`, `table`, etc) | [public and non-programmable]                           |
| [`cockroach sql`] non-interactive, non-SQL output (eg. time measurements)                                 | [public and non-programmable]                           |
| `cockroach dump` input format                                                                             | [public and programmable], see note 2 below             |
| `cockroach dump` output format                                                                            | [reserved], see note 1 below                            |
| `cockroach gen`, input format                                                                             | [public and programmable], see note 2 below             |
| `cockroach gen`, output format                                                                            | [public and non-programmable]                           |
| [`cockroach sqlfmt`], input format                                                                        | [public and programmable], see note 2 below             |
| [`cockroach sqlfmt`], output format                                                                       | [public and non-programmable]                           |
| `cockroach systembench`, input/output                                                                     | [reserved]                                              |
| [`cockroach workload`], input format                                                                      | [public and programmable], but currently [experimental] |
| [`cockroach workload`], output format                                                                     | [public and non-programmable]                           |

[`cockroach sql`]: use-the-built-in-sql-client.html
[`cockroach demo`]: cockroach-demo.html
[`cockroach workload`]: cockroach-workload.html
[`cockroach sqlfmt`]: use-the-query-formatter.html

Note 1: the output format of `cockroach dump` may change between
revisions, but the following guarantee is preserved: the database and
table contents that result from loading the output of `cockroach dump`
into another CockroachDB instance will be stable in the same way as
other public and programmable interfaces.

Note 2: new features may be added to the various `cockroach`
sub-commands across revisions, including extending the existing output
formats with additional details / columns. Automated tooling that
reads and parses the output of `cockroach` command must be built to
ignore input they do not understand.

## See also

- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
[experimental]: experimental-feature-lifecycle.html
