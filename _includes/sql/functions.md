### ANYELEMENT Functions

Function | Return
--- | ---
<code>pg_catalog.pg_typeof(anyelement)</code> | <a href="string.html">string</a>

### Comparison Functions

Function | Return
--- | ---
<code>greatest(anyelement...)</code> | anyelement
<code>least(anyelement...)</code> | anyelement

### Date and Time Functions

Function | Return
--- | ---
<code>age(<a href="timestamp.html">timestamptz</a>)</code> | <a href="interval.html">interval</a>
<code>age(<a href="timestamp.html">timestamptz</a>, <a href="timestamp.html">timestamptz</a>)</code> | <a href="interval.html">interval</a>
<code>clock_timestamp()</code> | <a href="timestamp.html">timestamp</a>
<code>clock_timestamp()</code> | <a href="timestamp.html">timestamptz</a>
<code>crdb_internal.force_retry(<a href="interval.html">interval</a>)</code> | <a href="int.html">int</a>
<code>current_date()</code> | <a href="date.html">date</a>
<code>current_timestamp()</code> | <a href="timestamp.html">timestamp</a>
<code>current_timestamp()</code> | <a href="timestamp.html">timestamptz</a>
<code>experimental_strptime(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="timestamp.html">timestamptz</a>
<code>extract(<a href="string.html">string</a>, <a href="timestamp.html">timestamp</a>)</code> | <a href="int.html">int</a>
<code>extract_duration(<a href="string.html">string</a>, <a href="interval.html">interval</a>)</code> | <a href="int.html">int</a>
<code>now()</code> | <a href="timestamp.html">timestamp</a>
<code>now()</code> | <a href="timestamp.html">timestamptz</a>
<code>statement_timestamp()</code> | <a href="timestamp.html">timestamp</a>
<code>statement_timestamp()</code> | <a href="timestamp.html">timestamptz</a>
<code>transaction_timestamp()</code> | <a href="timestamp.html">timestamp</a>
<code>transaction_timestamp()</code> | <a href="timestamp.html">timestamptz</a>

### ID Generation Functions

Function | Return
--- | ---
<code>experimental_unique_bytes()</code> | <a href="bytes.html">bytes</a>
<code>experimental_uuid_v4()</code> | <a href="bytes.html">bytes</a>
<code>unique_rowid()</code> | <a href="int.html">int</a>
<code>uuid_v4()</code> | <a href="bytes.html">bytes</a>

### Math and Numeric Functions

Function | Return
--- | ---
<code>abs(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>abs(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>abs(<a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>acos(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>asin(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>atan(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>atan2(<a href="float.html">float</a>, <a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>cbrt(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>cbrt(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>ceil(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>ceil(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>ceiling(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>ceiling(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>cos(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>cot(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>degrees(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>div(<a href="decimal.html">decimal</a>, <a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>div(<a href="float.html">float</a>, <a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>div(<a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>exp(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>exp(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>floor(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>floor(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>ln(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>ln(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>log(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>log(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>mod(<a href="decimal.html">decimal</a>, <a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>mod(<a href="float.html">float</a>, <a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>mod(<a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>pi()</code> | <a href="float.html">float</a>
<code>pow(<a href="decimal.html">decimal</a>, <a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>pow(<a href="float.html">float</a>, <a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>pow(<a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>power(<a href="decimal.html">decimal</a>, <a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>power(<a href="float.html">float</a>, <a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>power(<a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>radians(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>random()</code> | <a href="float.html">float</a>
<code>round(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>round(<a href="decimal.html">decimal</a>, <a href="int.html">int</a>)</code> | <a href="decimal.html">decimal</a>
<code>round(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>round(<a href="float.html">float</a>, <a href="int.html">int</a>)</code> | <a href="float.html">float</a>
<code>sign(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>sign(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>sign(<a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>sin(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>sqrt(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>sqrt(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>tan(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>
<code>to_hex(<a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>trunc(<a href="decimal.html">decimal</a>)</code> | <a href="decimal.html">decimal</a>
<code>trunc(<a href="float.html">float</a>)</code> | <a href="float.html">float</a>

### SETOF TUPLE{INT} Functions

Function | Return
--- | ---
<code>pg_catalog.generate_series(<a href="int.html">int</a>, <a href="int.html">int</a>)</code> | setof tuple{<a href="int.html">int</a>}
<code>pg_catalog.generate_series(<a href="int.html">int</a>, <a href="int.html">int</a>, <a href="int.html">int</a>)</code> | setof tuple{<a href="int.html">int</a>}

### String and Byte Functions

Function | Return
--- | ---
<code>ascii(<a href="string.html">string</a>)</code> | <a href="int.html">int</a>
<code>btrim(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>btrim(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>concat(<a href="string.html">string</a>...)</code> | <a href="string.html">string</a>
<code>concat_ws(<a href="string.html">string</a>...)</code> | <a href="string.html">string</a>
<code>experimental_strftime(<a href="date.html">date</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>experimental_strftime(<a href="timestamp.html">timestamp</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>experimental_strftime(<a href="timestamp.html">timestamptz</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>from_ip(<a href="bytes.html">bytes</a>)</code> | <a href="string.html">string</a>
<code>from_uuid(<a href="bytes.html">bytes</a>)</code> | <a href="string.html">string</a>
<code>initcap(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>left(<a href="bytes.html">bytes</a>, <a href="int.html">int</a>)</code> | <a href="bytes.html">bytes</a>
<code>left(<a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>length(<a href="bytes.html">bytes</a>)</code> | <a href="int.html">int</a>
<code>length(<a href="string.html">string</a>)</code> | <a href="int.html">int</a>
<code>lower(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>ltrim(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>ltrim(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>md5(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>octet_length(<a href="bytes.html">bytes</a>)</code> | <a href="int.html">int</a>
<code>octet_length(<a href="string.html">string</a>)</code> | <a href="int.html">int</a>
<code>overlay(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>overlay(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>pg_catalog.pg_get_expr(pg_node_tree: <a href="string.html">string</a>, relation_oid: <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>pg_catalog.pg_get_expr(pg_node_tree: <a href="string.html">string</a>, relation_oid: <a href="int.html">int</a>, pretty_<a href="bool.html">bool</a>: <a href="bool.html">bool</a>)</code> | <a href="string.html">string</a>
<code>pg_catalog.pg_get_userbyid(role_oid: <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>regexp_extract(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>regexp_replace(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>regexp_replace(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>repeat(<a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>replace(input: <a href="string.html">string</a>, from: <a href="string.html">string</a>, to: <a href="string.html">string</a>)</code> <br />Replace all occurrences of `from` with `to` in `input`. | <a href="string.html">string</a>
<code>reverse(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>right(<a href="bytes.html">bytes</a>, <a href="int.html">int</a>)</code> | <a href="bytes.html">bytes</a>
<code>right(<a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>rtrim(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>rtrim(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>sha1(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>sha256(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>split_part(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>strpos(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="int.html">int</a>
<code>substr(<a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>substr(<a href="string.html">string</a>, <a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>substr(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>substr(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>substring(<a href="string.html">string</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>substring(<a href="string.html">string</a>, <a href="int.html">int</a>, <a href="int.html">int</a>)</code> | <a href="string.html">string</a>
<code>substring(<a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>substring(<a href="string.html">string</a>, <a href="string.html">string</a>, <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>to_ip(<a href="string.html">string</a>)</code> | <a href="bytes.html">bytes</a>
<code>to_uuid(<a href="string.html">string</a>)</code> | <a href="bytes.html">bytes</a>
<code>translate(input: <a href="string.html">string</a>, from: <a href="string.html">string</a>, to: <a href="string.html">string</a>)</code> | <a href="string.html">string</a>
<code>upper(<a href="string.html">string</a>)</code> | <a href="string.html">string</a>

### System Info Functions

Function | Return
--- | ---
<code>array_length(anyelement[], <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>array_lower(anyelement[], <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>array_upper(anyelement[], <a href="int.html">int</a>)</code> | <a href="int.html">int</a>
<code>cluster_logical_timestamp()</code> | <a href="decimal.html">decimal</a>
<code>current_schema()</code> | <a href="string.html">string</a>
<code>current_schemas(<a href="bool.html">bool</a>)</code> | <a href="string.html">string</a>[]
<code>version()</code> | <a href="string.html">string</a>

