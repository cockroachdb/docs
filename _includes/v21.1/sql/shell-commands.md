The following commands can be used within the interactive SQL shell:

Command | Usage
--------|------------
`\?`<br>`help` | View this help within the shell.
`\q`<br>`quit`<br>`exit`<br>`ctrl-d` | Exit the shell.<br><br>When no text follows the prompt, `ctrl-c` exits the shell as well; otherwise, `ctrl-c` clears the line.
`\!` | Run an external command and print its results to `stdout`. [See an example](cockroach-sql.html#run-external-commands-from-the-sql-shell).
<code>&#92;&#124;</code> | Run the output of an external command as SQL statements. [See an example](cockroach-sql.html#run-external-commands-from-the-sql-shell).
`\set <option>`<br>`\unset <option>` | Enable or disable a client-side option. For more details, see [Client-side options](#client-side-options).<br><br>You can also use the [`--set` flag](#general) to enable or disable client-side options before starting the SQL shell.
`\show` | During a multi-line statement or transaction, show the SQL entered so far.
`\h <statement>`<br>`\hf <function>` | View help for specific SQL statements or functions. See [SQL shell help](#help) for more details.
`\l` | List all databases in the CockroachDB cluster. This command is equivalent to [`SHOW DATABASES`](show-databases.html).
`\dt`<br>`d` | Show the tables of the current schema in the current database. These commands are equivalent to [`SHOW TABLES`](show-tables.html).
`\dT` |  Show the [user-defined types](enum.html) in the current database. This command is equivalent to [`SHOW TYPES`](show-types.html).
`\du` | List the users for all databases. This command is equivalent to [`SHOW USERS`](show-users.html).
`\d <table>` | Show details about columns in the specified table. This command is equivalent to [`SHOW COLUMNS`](show-columns.html).
