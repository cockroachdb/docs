`%` | Return
--- | ---
<a href="decimal.html">decimal</a> `%` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="decimal.html">decimal</a> `%` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="float.html">float</a> `%` <a href="float.html">float</a> | <a href="float.html">float</a>
<a href="int.html">int</a> `%` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="int.html">int</a> `%` <a href="int.html">int</a> | <a href="int.html">int</a>

`&` | Return
--- | ---
<a href="int.html">int</a> `&` <a href="int.html">int</a> | <a href="int.html">int</a>

`*` | Return
--- | ---
<a href="decimal.html">decimal</a> `*` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="decimal.html">decimal</a> `*` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="float.html">float</a> `*` <a href="float.html">float</a> | <a href="float.html">float</a>
<a href="int.html">int</a> `*` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="int.html">int</a> `*` <a href="int.html">int</a> | <a href="int.html">int</a>
<a href="int.html">int</a> `*` <a href="interval.html">interval</a> | <a href="interval.html">interval</a>
<a href="interval.html">interval</a> `*` <a href="int.html">int</a> | <a href="interval.html">interval</a>

`+` | Return
--- | ---
`+`<a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
`+`<a href="float.html">float</a> | <a href="float.html">float</a>
`+`<a href="int.html">int</a> | <a href="int.html">int</a>
<a href="date.html">date</a> `+` <a href="int.html">int</a> | <a href="date.html">date</a>
<a href="date.html">date</a> `+` <a href="interval.html">interval</a> | <a href="timestamp.html">timestamptz</a>
<a href="decimal.html">decimal</a> `+` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="decimal.html">decimal</a> `+` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="float.html">float</a> `+` <a href="float.html">float</a> | <a href="float.html">float</a>
<a href="int.html">int</a> `+` <a href="date.html">date</a> | <a href="date.html">date</a>
<a href="int.html">int</a> `+` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="int.html">int</a> `+` <a href="int.html">int</a> | <a href="int.html">int</a>
<a href="interval.html">interval</a> `+` <a href="date.html">date</a> | <a href="timestamp.html">timestamptz</a>
<a href="interval.html">interval</a> `+` <a href="interval.html">interval</a> | <a href="interval.html">interval</a>
<a href="interval.html">interval</a> `+` <a href="timestamp.html">timestamp</a> | <a href="timestamp.html">timestamp</a>
<a href="interval.html">interval</a> `+` <a href="timestamp.html">timestamptz</a> | <a href="timestamp.html">timestamptz</a>
<a href="timestamp.html">timestamp</a> `+` <a href="interval.html">interval</a> | <a href="timestamp.html">timestamp</a>
<a href="timestamp.html">timestamptz</a> `+` <a href="interval.html">interval</a> | <a href="timestamp.html">timestamptz</a>

`-` | Return
--- | ---
`-`<a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
`-`<a href="float.html">float</a> | <a href="float.html">float</a>
`-`<a href="int.html">int</a> | <a href="int.html">int</a>
`-`<a href="interval.html">interval</a> | <a href="interval.html">interval</a>
<a href="date.html">date</a> `-` <a href="date.html">date</a> | <a href="int.html">int</a>
<a href="date.html">date</a> `-` <a href="int.html">int</a> | <a href="date.html">date</a>
<a href="date.html">date</a> `-` <a href="interval.html">interval</a> | <a href="timestamp.html">timestamptz</a>
<a href="decimal.html">decimal</a> `-` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="decimal.html">decimal</a> `-` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="float.html">float</a> `-` <a href="float.html">float</a> | <a href="float.html">float</a>
<a href="int.html">int</a> `-` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="int.html">int</a> `-` <a href="int.html">int</a> | <a href="int.html">int</a>
<a href="interval.html">interval</a> `-` <a href="interval.html">interval</a> | <a href="interval.html">interval</a>
<a href="timestamp.html">timestamp</a> `-` <a href="interval.html">interval</a> | <a href="timestamp.html">timestamp</a>
<a href="timestamp.html">timestamp</a> `-` <a href="timestamp.html">timestamp</a> | <a href="interval.html">interval</a>
<a href="timestamp.html">timestamp</a> `-` <a href="timestamp.html">timestamptz</a> | <a href="interval.html">interval</a>
<a href="timestamp.html">timestamptz</a> `-` <a href="interval.html">interval</a> | <a href="timestamp.html">timestamptz</a>
<a href="timestamp.html">timestamptz</a> `-` <a href="timestamp.html">timestamp</a> | <a href="interval.html">interval</a>
<a href="timestamp.html">timestamptz</a> `-` <a href="timestamp.html">timestamptz</a> | <a href="interval.html">interval</a>

`/` | Return
--- | ---
<a href="decimal.html">decimal</a> `/` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="decimal.html">decimal</a> `/` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="float.html">float</a> `/` <a href="float.html">float</a> | <a href="float.html">float</a>
<a href="int.html">int</a> `/` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="int.html">int</a> `/` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="interval.html">interval</a> `/` <a href="int.html">int</a> | <a href="interval.html">interval</a>

`//` | Return
--- | ---
<a href="decimal.html">decimal</a> `//` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="decimal.html">decimal</a> `//` <a href="int.html">int</a> | <a href="decimal.html">decimal</a>
<a href="float.html">float</a> `//` <a href="float.html">float</a> | <a href="float.html">float</a>
<a href="int.html">int</a> `//` <a href="decimal.html">decimal</a> | <a href="decimal.html">decimal</a>
<a href="int.html">int</a> `//` <a href="int.html">int</a> | <a href="int.html">int</a>

`<` | Return
--- | ---
<a href="bool.html">bool</a> `<` <a href="bool.html">bool</a> | <a href="bool.html">bool</a>
<a href="bytes.html">bytes</a> `<` <a href="bytes.html">bytes</a> | <a href="bool.html">bool</a>
collatedstring{} `<` collatedstring{} | <a href="bool.html">bool</a>
<a href="date.html">date</a> `<` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="date.html">date</a> `<` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="date.html">date</a> `<` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `<` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `<` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `<` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `<` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `<` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `<` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `<` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `<` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `<` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="interval.html">interval</a> `<` <a href="interval.html">interval</a> | <a href="bool.html">bool</a>
<a href="string.html">string</a> `<` <a href="string.html">string</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `<` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `<` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `<` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `<` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `<` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `<` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
tuple `<` tuple | <a href="bool.html">bool</a>

`<<` | Return
--- | ---
<a href="int.html">int</a> `<<` <a href="int.html">int</a> | <a href="int.html">int</a>

`<=` | Return
--- | ---
<a href="bool.html">bool</a> `<=` <a href="bool.html">bool</a> | <a href="bool.html">bool</a>
<a href="bytes.html">bytes</a> `<=` <a href="bytes.html">bytes</a> | <a href="bool.html">bool</a>
collatedstring{} `<=` collatedstring{} | <a href="bool.html">bool</a>
<a href="date.html">date</a> `<=` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="date.html">date</a> `<=` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="date.html">date</a> `<=` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `<=` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `<=` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `<=` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `<=` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `<=` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `<=` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `<=` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `<=` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `<=` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="interval.html">interval</a> `<=` <a href="interval.html">interval</a> | <a href="bool.html">bool</a>
<a href="string.html">string</a> `<=` <a href="string.html">string</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `<=` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `<=` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `<=` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `<=` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `<=` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `<=` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
tuple `<=` tuple | <a href="bool.html">bool</a>

`=` | Return
--- | ---
<a href="bool.html">bool</a> `=` <a href="bool.html">bool</a> | <a href="bool.html">bool</a>
<a href="bytes.html">bytes</a> `=` <a href="bytes.html">bytes</a> | <a href="bool.html">bool</a>
collatedstring{} `=` collatedstring{} | <a href="bool.html">bool</a>
<a href="date.html">date</a> `=` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="date.html">date</a> `=` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="date.html">date</a> `=` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `=` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `=` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `=` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `=` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `=` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="float.html">float</a> `=` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `=` <a href="decimal.html">decimal</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `=` <a href="float.html">float</a> | <a href="bool.html">bool</a>
<a href="int.html">int</a> `=` <a href="int.html">int</a> | <a href="bool.html">bool</a>
<a href="interval.html">interval</a> `=` <a href="interval.html">interval</a> | <a href="bool.html">bool</a>
oid `=` oid | <a href="bool.html">bool</a>
<a href="string.html">string</a> `=` <a href="string.html">string</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `=` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `=` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `=` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `=` <a href="date.html">date</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `=` <a href="timestamp.html">timestamp</a> | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `=` <a href="timestamp.html">timestamptz</a> | <a href="bool.html">bool</a>
tuple `=` tuple | <a href="bool.html">bool</a>

`>>` | Return
--- | ---
<a href="int.html">int</a> `>>` <a href="int.html">int</a> | <a href="int.html">int</a>

`ILIKE` | Return
--- | ---
<a href="string.html">string</a> `ILIKE` <a href="string.html">string</a> | <a href="bool.html">bool</a>

`IN` | Return
--- | ---
<a href="bool.html">bool</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="bytes.html">bytes</a> `IN` tuple | <a href="bool.html">bool</a>
collatedstring{} `IN` tuple | <a href="bool.html">bool</a>
<a href="date.html">date</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="decimal.html">decimal</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="float.html">float</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="int.html">int</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="interval.html">interval</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="string.html">string</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamp</a> `IN` tuple | <a href="bool.html">bool</a>
<a href="timestamp.html">timestamptz</a> `IN` tuple | <a href="bool.html">bool</a>
tuple `IN` tuple | <a href="bool.html">bool</a>

`LIKE` | Return
--- | ---
<a href="string.html">string</a> `LIKE` <a href="string.html">string</a> | <a href="bool.html">bool</a>

`SIMILAR TO` | Return
--- | ---
<a href="string.html">string</a> `SIMILAR TO` <a href="string.html">string</a> | <a href="bool.html">bool</a>

`^` | Return
--- | ---
<a href="int.html">int</a> `^` <a href="int.html">int</a> | <a href="int.html">int</a>

`|` | Return
--- | ---
<a href="int.html">int</a> `|` <a href="int.html">int</a> | <a href="int.html">int</a>

`||` | Return
--- | ---
<a href="bytes.html">bytes</a> `||` <a href="bytes.html">bytes</a> | <a href="bytes.html">bytes</a>
<a href="string.html">string</a> `||` <a href="string.html">string</a> | <a href="string.html">string</a>

`~` | Return
--- | ---
`~`<a href="int.html">int</a> | <a href="int.html">int</a>
<a href="string.html">string</a> `~` <a href="string.html">string</a> | <a href="bool.html">bool</a>

`~*` | Return
--- | ---
<a href="string.html">string</a> `~*` <a href="string.html">string</a> | <a href="bool.html">bool</a>

