---
title: Generate CLI Utilities & Example Data
summary: Use cockroach gen to generate command-line interface utlities, such as man pages, and example data.
toc: false
---

The `cockroach gen` command can generate command-line interface (CLI) utilities ([`man` pages](https://en.wikipedia.org/wiki/Man_page) and a`bash` autocompletion script), as well as example SQL data suitable to populate test databases.

<div id="toc"></div>

## Subcommands

| Subcommand | Usage |
| -----------|------ |
| `man` | Generate man pages for CockroachDB. |
| `autocomplete` | Generate bash autocompletion script for CockroachDB. |
| `example-data` | Generate example SQL code. |

## Synopsis

~~~ shell
# Generate man pages:
$ cockroach gen man 

# Generate bash autocompletion script:
$ cockroach gen autocomplete

# Generate example SQL data:
$ cockroach gen example-data | cockroach sql
~~~

## Flags

The `gen` subcommands only support [logging flags](cockroach-commands.html#logging-flags).

## Examples

### Generate man Pages

~~~ shell
# Generate man pages:
$ cockroach gen man

# Move the man pages to the man directory:
$ sudo mv man/man1/* /usr/share/man/man1

# Access man pages:
$ man cockroach
~~~

### Generate bash Autocompletion Script

~~~ shell
# Generate bash autocompletion script:
$ cockroach gen autocomplete

# Add the script to your .bashrc and .bash_profle:
$ printf "\n\n#cockroach bash autocomplete\nsource '<path to>cockroach.bash'" >> ~/.bashrc
$ printf "\n\n#cockroach bash autocomplete\nsource '<path to>cockroach.bash'" >> ~/.bash_profile
~~~

You can now use `tab` to autocomplete `cockroach` commands.

### Generate Example Data

To test out CockroachDB, you can generate an example database, `startrek`, that contains 2 tables, `episodes` and `quotes`.

~~~ shell
# Generate example SQL data:
$ cockroach gen example-data | cockroach sql

# Launch the built-in SQL client to view it:
$ cockroach sql
~~~
~~~ sql
> SHOW TABLES FROM startrek;
~~~
~~~
+----------+
|  Table   |
+----------+
| episodes |
| quotes   |
+----------+
~~~

{{site.data.alerts.callout_success}}You can find example databases by using <code>cockroach gen example-data --help</code>.{{site.data.alerts.end}}

## See Also

[Other Cockroach Commands](cockroach-commands.html)
