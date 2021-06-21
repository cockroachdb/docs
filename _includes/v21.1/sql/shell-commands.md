The following commands can be used within the interactive SQL shell:

Command | Usage
--------|------------
`\?`<br><br>`help` | View this help within the shell.
`\q`<br><br>`quit`<br><br>`exit`<br><br>`ctrl-d` | Exit the shell.<br>When no text follows the prompt, `ctrl-c` exits the shell as well; otherwise, `ctrl-c` clears the line.
`\!` | Run an external command and print its results to `stdout`. [See an example](cockroach-sql.html#run-external-commands-from-the-sql-shell).
<code>&#92;&#124;</code> | Run the output of an external command as SQL statements. [See an example](cockroach-sql.html#run-external-commands-from-the-sql-shell).
`\set <option>`<br><br>`\unset <option>` | Enable or disable a client-side option. For more details, see [Client-side options](#client-side-options).<br>You can also use the [`--set` flag](#general) to enable or disable client-side options before starting the SQL shell.
`\show`<br><br>`\p` | During a multi-line statement or transaction, show the SQL that has been entered but not yet executed.<br><span class="version-tag">New in v21.1:</span>`\show` is deprecated in v21.1. Use `\p` instead.
`\h <statement>`<br><br>`\hf <function>` | View help for specific SQL statements or functions. See [SQL shell help](#help) for more details.
`\c`<br><br>`\connect` | <span class="version-tag">New in v21.1</span>: Change the current database. This is equivalent to `SET <database>` and `USE <database>`.
`\l` | List all databases in the CockroachDB cluster. This command is equivalent to [`SHOW DATABASES`](show-databases.html).
`\dt`<br><br>`d` | Show the tables of the current schema in the current database. These commands are equivalent to [`SHOW TABLES`](show-tables.html).
`\dT` |  Show the [user-defined types](enum.html) in the current database. This command is equivalent to [`SHOW TYPES`](show-types.html).
`\du` | List the users for all databases. This command is equivalent to [`SHOW USERS`](show-users.html).
`\d <table>` | Show details about columns in the specified table. This command is equivalent to [`SHOW COLUMNS`](show-columns.html).
`\r` |  <span class="version-tag">New in v21.1:</span> Resets the query input buffer, clearing all SQL statements that have been entered but not yet executed.
`\i <filename>` |  <span class="version-tag">New in v21.1:</span> Reads and executes input from the file `<filename>`, in the current working directory.
`\ir <filename>` |  <span class="version-tag">New in v21.1:</span> Reads and executes input from the file `<filename>`.<br>When invoked in the interactive shell, `\i` and `\ir` behave identically (i.e., CockroachDB looks for `<filename>` in the current working directory). When invoked from a script, CockroachDB looks for `<filename>` relative to the directory in which the script is located.
`\echo <arguments>` |  <span class="version-tag">New in v21.1:</span> Evaluate the `<arguments>` and print the results to the standard output.
`\x <boolean>` |  <span class="version-tag">New in v21.1:</span> When `true`/`on`/`yes`/`1`, [sets the display format](cockroach-sql.html#sql-flag-format) to `records`. When `false`/`off`/`no`/`0`, sets the session's format to the default (`table`/`tsv`).
