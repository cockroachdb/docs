- To view option descriptions and how they are currently set, use `\set` without any options.
- To enable or disable an option, use `\set <option> <value>` or `\unset <option> <value>`. You can also use the form `<option>=<value>`.
- If an option accepts a boolean value:
    - `\set <option>` without `<value>` is equivalent to `\set <option> true`, and `\unset <option>` without `<value>` is equivalent to `\set <option> false`.
    - `on` and `0` are aliases for `true`, and `off` and `1` are aliases for `false`.

Client Options | Description
---------------|------------
<a name="sql-option-auto-trace"></a> `auto_trace` | For every statement executed, the shell also produces the trace for that statement in a separate result below. A trace is also produced in case the statement produces a SQL error.<br><br>**Default:** `off`<br><br>To enable this option, run `\set auto_trace on`.
<a name="sql-option-check-syntax"></a> `check_syntax` | Validate SQL syntax. This ensures that a typo or mistake during user entry does not inconveniently abort an ongoing transaction previously started from the interactive shell.<br /><br />**Default:** `true` for [interactive sessions](cockroach-sql.html#session-and-output-types); `false` otherwise.<br><br>To disable this option, run `\unset check_syntax`.
<a name="sql-option-display-format"></a> `display_format` | How to display table rows printed within the interactive SQL shell. Possible values: `tsv`, `csv`, `table`, `raw`, `records`, `sql`, `html`.<br><br>**Default:** `table` for sessions that [output on a terminal](cockroach-sql.html#session-and-output-types); `tsv` otherwise<br /><br />To change this option, run `\set display_format <format>`. [See an example](cockroach-sql.html#make-the-output-of-show-statements-selectable).
`echo` | Reveal the SQL statements sent implicitly by the SQL shell.<br><br>**Default:** `false`<br><br>To enable this option, run `\set echo`. [See an example](cockroach-sql.html#reveal-the-sql-statements-sent-implicitly-by-the-command-line-utility).
<a name="sql-option-errexit"></a> `errexit` | Exit the SQL shell upon encountering an error.<br /><br />**Default:** `false` for [interactive sessions](cockroach-sql.html#session-and-output-types); `true` otherwise<br><br>To enable this option, run `\set errexit`.
`show_times` | Reveal the time a query takes to complete. Possible values:<br><ul><li>`execution` time refers to the time taken by the SQL execution engine to execute the query.</li><li>`network` time refers to the network latency between the server and the SQL client command.</li><li>`other` time refers to all other forms of latency affecting the total query completion time, including query planning.</li></ul><br>**Default:** `true`<br><br>To disable this option, run `\unset show_times`.
