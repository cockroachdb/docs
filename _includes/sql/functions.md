### Comparison Functions

Function &rarr; Returns | Description
--- | ---
<code>greatest(anyelement...) &rarr; anyelement</code> | <span class="funcdesc">Returns the element with the greatest value.</span>
<code>least(anyelement...) &rarr; anyelement</code> | <span class="funcdesc">Returns the element with the lowest value.</span>

### Date and Time Functions

Function &rarr; Returns | Description
--- | ---
<code>age(begin: <a href="timestamp.html">timestamptz</a>, end: <a href="timestamp.html">timestamptz</a>) &rarr; <a href="interval.html">interval</a></code> | <span class="funcdesc">Calculates the interval between `begin` and `end`.</span>
<code>age(val: <a href="timestamp.html">timestamptz</a>) &rarr; <a href="interval.html">interval</a></code> | <span class="funcdesc">Calculates the interval between `val` and the current time.</span>
<code>clock_timestamp() &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Returns the current wallclock time.</span>
<code>clock_timestamp() &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Returns the current wallclock time.</span>
<code>crdb_internal.force_retry(val: <a href="interval.html">interval</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">This function is used only by CockroachDB's developers for testing purposes.</span>
<code>current_date() &rarr; <a href="date.html">date</a></code> | <span class="funcdesc">Returns the current date.</span>
<code>current_timestamp() &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Returns the current transaction's timestamp.</span>
<code>current_timestamp() &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Returns the current transaction's timestamp.</span>
<code>experimental_strptime(format: <a href="string.html">string</a>, input: <a href="string.html">string</a>) &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Returns `input` as a timestamptz using `format` (which uses standard `strptime` formatting).</span>
<code>extract(element: <a href="string.html">string</a>, input: <a href="date.html">date</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Extracts `element` from `input`. Compatible `elements` are: <br/>&#8226; year<br/>&#8226; quarter<br/>&#8226; month<br/>&#8226; week<br/>&#8226; dayofweek<br/>&#8226; dayofyear<br/>&#8226; hour<br/>&#8226; minute<br/>&#8226; second<br/>&#8226; millisecond<br/>&#8226; microsecond<br/>&#8226; epoch</span>
<code>extract(element: <a href="string.html">string</a>, input: <a href="timestamp.html">timestamp</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Extracts `element` from `input`. Compatible `elements` are: <br/>&#8226; year<br/>&#8226; quarter<br/>&#8226; month<br/>&#8226; week<br/>&#8226; dayofweek<br/>&#8226; dayofyear<br/>&#8226; hour<br/>&#8226; minute<br/>&#8226; second<br/>&#8226; millisecond<br/>&#8226; microsecond<br/>&#8226; epoch</span>
<code>extract_duration(element: <a href="string.html">string</a>, input: <a href="interval.html">interval</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Extracts `element` from `input`. Compatible `elements` are: <br/>&#8226; hour<br/>&#8226; minute<br/>&#8226; second<br/>&#8226; millisecond<br/>&#8226; microsecond</span>
<code>now() &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Returns the current transaction's timestamp.</span>
<code>now() &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Returns the current transaction's timestamp.</span>
<code>statement_timestamp() &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Returns the current statement's timestamp.</span>
<code>statement_timestamp() &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Returns the current statement's timestamp.</span>
<code>transaction_timestamp() &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Returns the current transaction's timestamp.</span>
<code>transaction_timestamp() &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Returns the current transaction's timestamp.</span>

### ID Generation Functions

Function &rarr; Returns | Description
--- | ---
<code>experimental_uuid_v4() &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Returns a UUID.</span>
<code>unique_rowid() &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Returns a unique ID used by CockroachDB to generate unique row IDs if a Primary Key isn't defined for the table. The value is a combination of the  insert timestamp and the ID of the node executing the statement, which  guarantees this combination is globally unique.</span>
<code>uuid_v4() &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Returns a UUID.</span>

### Math and Numeric Functions

Function &rarr; Returns | Description
--- | ---
<code>abs(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the absolute value of `val`.</span>
<code>abs(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the absolute value of `val`.</span>
<code>abs(val: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the absolute value of `val`.</span>
<code>acos(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the inverse cosine of `val`.</span>
<code>asin(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the inverse sine of `val`.</span>
<code>atan(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the inverse tangent of `val`.</span>
<code>atan2(x: <a href="float.html">float</a>, y: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the inverse tangent of `x`/`y`.</span>
<code>cbrt(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the cube root (&#8731;) of `val`.</span>
<code>cbrt(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the cube root (&#8731;) of `val`.</span>
<code>ceil(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the smallest integer greater than `val`.</span>
<code>ceil(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the smallest integer greater than `val`.</span>
<code>ceiling(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the smallest integer greater than `val`.</span>
<code>ceiling(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the smallest integer greater than `val`.</span>
<code>cos(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the cosine of `val`.</span>
<code>cot(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the cotangent of `val`.</span>
<code>crdb_internal.force_retry(val: <a href="interval.html">interval</a>, txnID: <a href="string.html">string</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">This function is used only by CockroachDB's developers for testing purposes.</span>
<code>degrees(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Converts `val` as a radian value to a degree value.</span>
<code>div(x: <a href="decimal.html">decimal</a>, y: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the integer quotient of `x`/`y`.</span>
<code>div(x: <a href="float.html">float</a>, y: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the integer quotient of `x`/`y`.</span>
<code>div(x: <a href="int.html">int</a>, y: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the integer quotient of `x`/`y`.</span>
<code>exp(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates *e* ^ `val`.</span>
<code>exp(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates *e* ^ `val`.</span>
<code>floor(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the largest integer not greater than `val`.</span>
<code>floor(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the largest integer not greater than `val`.</span>
<code>ln(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the natural log of `val`.</span>
<code>ln(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the natural log of `val`.</span>
<code>log(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the base 10 log of `val`.</span>
<code>log(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the base 10 log of `val`.</span>
<code>mod(x: <a href="decimal.html">decimal</a>, y: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates `x`%`y`.</span>
<code>mod(x: <a href="float.html">float</a>, y: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates `x`%`y`.</span>
<code>mod(x: <a href="int.html">int</a>, y: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates `x`%`y`.</span>
<code>pi() &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Returns the value for pi (3.141592653589793).</span>
<code>pow(x: <a href="decimal.html">decimal</a>, y: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates `x`^`y`.</span>
<code>pow(x: <a href="float.html">float</a>, y: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates `x`^`y`.</span>
<code>pow(x: <a href="int.html">int</a>, y: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates `x`^`y`.</span>
<code>power(x: <a href="decimal.html">decimal</a>, y: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates `x`^`y`.</span>
<code>power(x: <a href="float.html">float</a>, y: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates `x`^`y`.</span>
<code>power(x: <a href="int.html">int</a>, y: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates `x`^`y`.</span>
<code>radians(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Converts `val` as a degree value to a radians value.</span>
<code>random() &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Returns a random float between 0 and 1.</span>
<code>round(input: <a href="decimal.html">decimal</a>, <a href="decimal.html">decimal</a>_accuracy: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Keeps `decimal_accuracy` number of figures to the right of the zero position  in `input`.</span>
<code>round(input: <a href="float.html">float</a>, <a href="decimal.html">decimal</a>_accuracy: <a href="int.html">int</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Keeps `decimal_accuracy` number of figures to the right of the zero position  in `input`.</span>
<code>round(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Rounds `val` to the nearest integer.</span>
<code>round(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Rounds `val` to the nearest integer.</span>
<code>sign(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Determines the sign of `val`: **1** for positive; **0** for 0 values; **-1** for negative.</span>
<code>sign(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Determines the sign of `val`: **1** for positive; **0** for 0 values; **-1** for negative.</span>
<code>sign(val: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Determines the sign of `val`: **1** for positive; **0** for 0 values; **-1** for negative.</span>
<code>sin(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the sine of `val`.</span>
<code>sqrt(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the square root of `val`.</span>
<code>sqrt(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the square root of `val`.</span>
<code>tan(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the tangent of `val`.</span>
<code>to_hex(val: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Converts `val` to its hexadecimal representation.</span>
<code>trunc(val: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Truncates the decimal values of `val`.</span>
<code>trunc(val: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Truncates the decimal values of `val`.</span>

### String and Byte Functions

Function &rarr; Returns | Description
--- | ---
<code>ascii(val: <a href="string.html">string</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the ASCII value for the first character in `val`.</span>
<code>btrim(input: <a href="string.html">string</a>, trim_chars: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Removes any characters included in `trim_chars` from the beginning or end of `input` (applies recursively). <br/><br/>For example, `btrim('doggie', 'eod')` returns `ggi`.</span>
<code>btrim(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Removes all spaces from the beginning and end of `val`.</span>
<code>concat(<a href="string.html">string</a>...) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Concatenates a comma-separated list of strings.</span>
<code>concat_ws(<a href="string.html">string</a>...) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Uses the first argument as a separator between the concatenation of the subsequent arguments. <br/><br/>For example `concat_ws('!','wow','great')` returns `wow!great`.</span>
<code>experimental_strftime(input: <a href="date.html">date</a>, extract_format: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">From `input`, extracts and formats the time as identified in `extract_format` using standard `strftime` notation (though not all formatting is supported).</span>
<code>experimental_strftime(input: <a href="timestamp.html">timestamp</a>, extract_format: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">From `input`, extracts and formats the time as identified in `extract_format` using standard `strftime` notation (though not all formatting is supported).</span>
<code>experimental_strftime(input: <a href="timestamp.html">timestamptz</a>, extract_format: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">From `input`, extracts and formats the time as identified in `extract_format` using standard `strftime` notation (though not all formatting is supported).</span>
<code>from_ip(val: <a href="bytes.html">bytes</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Converts the byte string representation of an IP to its character string representation.</span>
<code>from_uuid(val: <a href="bytes.html">bytes</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Converts the byte string representation of a UUID to its character string representation.</span>
<code>initcap(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Capitalizes the first letter of `val`.</span>
<code>left(input: <a href="bytes.html">bytes</a>, return_set: <a href="int.html">int</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Returns the first `return_set` bytes from `input`.</span>
<code>left(input: <a href="string.html">string</a>, return_set: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns the first `return_set` characters from `input`.</span>
<code>length(val: <a href="bytes.html">bytes</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the number of bytes in `val`.</span>
<code>length(val: <a href="string.html">string</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the number of characters in `val`.</span>
<code>lower(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Converts all characters in `val`to their lower-case equivalents.</span>
<code>ltrim(input: <a href="string.html">string</a>, trim_chars: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Removes any characters included in `trim_chars` from the beginning (left-hand side) of `input` (applies recursively). <br/><br/>For example, `ltrim('doggie', 'od')` returns `ggie`.</span>
<code>ltrim(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Removes all spaces from the beginning (left-hand side) of `val`.</span>
<code>md5(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Calculates the MD5 hash value of `val`.</span>
<code>octet_length(val: <a href="bytes.html">bytes</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the number of bytes in `val`.</span>
<code>octet_length(val: <a href="string.html">string</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the number of bytes used to represent `val`.</span>
<code>overlay(input: <a href="string.html">string</a>, overlay_val: <a href="string.html">string</a>, start_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Replaces characters in `input` with `overlay_val` starting at `start_pos` (begins at 1). <br/><br/>For example, `overlay('doggie', 'CAT', 2)` returns `dCATie`.</span>
<code>overlay(input: <a href="string.html">string</a>, overlay_val: <a href="string.html">string</a>, start_pos: <a href="int.html">int</a>, end_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Deletes the characters in `input` between `start_pos` and `end_pos` (count starts at 1), and then insert `overlay_val` at `start_pos`.</span>
<code>regexp_extract(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns the first match for the Regular Expression `regex` in `input`.</span>
<code>regexp_replace(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>, replace: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Replaces matches for the Regular Expression `regex` in `input` with the Regular Expression `replace`.</span>
<code>regexp_replace(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>, replace: <a href="string.html">string</a>, flags: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Replaces matches for the Regular Expression `regex` in `input` with the Regular Expression `replace` using `flags`.<br/><br/>CockroachDB supports the following flags:<br/><br/>&#8226; **c**: Case-sensitive matching<br/><br/>&#8226; **g**: Global matching (match each substring instead of only the first).<br/><br/>&#8226; **i**: Case-insensitive matching<br/><br/>&#8226; **m** or **n**: Newline-sensitive `.` and negated brackets (`[^...]`) do not match newline characters (preventing matching: matches from crossing newlines unless explicitly defined to); `^` and `$` match the space before and after newline characters respectively (so characters between newline characters are treated as if they're on a separate line).<br/><br/>&#8226; **p**: Partial newline-sensitive matching: `.` and negated brackets (`[^...]`) do not match newline characters (preventing matches from crossing newlines unless explicitly defined to), but `^` and `$` still only match the beginning and end of `val`.<br/><br/>&#8226; **s**: Newline-insensitive matching *(default)*.<br/><br/>&#8226; **w**: Inverse partial newline-sensitive matching:`.` and negated brackets (`[^...]`) *do* match newline characters, but  `^` and `$` match the space before and after newline characters respectively (so characters between newline characters are treated as if they're on a separate line).</span>
<code>repeat(input: <a href="string.html">string</a>, repeat_counter: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Concatenates `input` `repeat_counter` number of times.<br/><br/>For example, `repeat('dog', 2)` returns `dogdog`.</span>
<code>replace(input: <a href="string.html">string</a>, find: <a href="string.html">string</a>, replace: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Replaces all occurrences of `find` with `replace` in `input`</span>
<code>reverse(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Reverses the order of the string's characters.</span>
<code>right(input: <a href="bytes.html">bytes</a>, return_set: <a href="int.html">int</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Returns the last `return_set` bytes from `input`.</span>
<code>right(input: <a href="string.html">string</a>, return_set: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns the last `return_set` characters from `input`.</span>
<code>rtrim(input: <a href="string.html">string</a>, trim_chars: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Removes any characters included in `trim_chars` from the end (right-hand side) of `input` (applies recursively). <br/><br/>For example, `rtrim('doggie', 'ei')` returns `dogg`.</span>
<code>rtrim(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Removes all spaces from the end (right-hand side) of `val`.</span>
<code>sha1(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Calculates the SHA1 hash value of `val`.</span>
<code>sha256(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Calculates the SHA256 hash value of `val`.</span>
<code>split_part(input: <a href="string.html">string</a>, delimiter: <a href="string.html">string</a>, return_index_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Splits `input` on `delimiter` and return the value in the `return_index_pos`  position (starting at 1). <br/><br/>For example, `split_part('123.456.789.0','.',3)`returns `789`.</span>
<code>strpos(input: <a href="string.html">string</a>, find: <a href="string.html">string</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the position where the string `find` begins in `input`. <br/><br/>For example, `strpos('doggie', 'gie')` returns `4`.</span>
<code>substr(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` that matches the regular expression `regex`.</span>
<code>substr(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>, escape_char: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` that matches the regular expression `regex` using `escape_char` as your escape character instead of `\`.</span>
<code>substr(input: <a href="string.html">string</a>, start_pos: <a href="int.html">int</a>, end_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` between `start_pos` and `end_pos` (count starts at 1).</span>
<code>substr(input: <a href="string.html">string</a>, substr_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` starting at `substr_pos` (count starts at 1).</span>
<code>substring(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` that matches the regular expression `regex`.</span>
<code>substring(input: <a href="string.html">string</a>, regex: <a href="string.html">string</a>, escape_char: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` that matches the regular expression `regex` using `escape_char` as your escape character instead of `\`.</span>
<code>substring(input: <a href="string.html">string</a>, start_pos: <a href="int.html">int</a>, end_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` between `start_pos` and `end_pos` (count starts at 1).</span>
<code>substring(input: <a href="string.html">string</a>, substr_pos: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns a substring of `input` starting at `substr_pos` (count starts at 1).</span>
<code>to_ip(val: <a href="string.html">string</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Converts the character string representation of an IP to its byte string representation.</span>
<code>to_uuid(val: <a href="string.html">string</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Converts the character string representation of a UUID to its byte string representation.</span>
<code>translate(input: <a href="string.html">string</a>, find: <a href="string.html">string</a>, replace: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">In `input`, replaces the first character from `find` with the first character in `replace`; repeat for each character in `find`. <br/><br/>For example, `translate('doggie', 'dog', '123');` returns `1233ie`.</span>
<code>upper(val: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Converts all characters in `val`to their to their upper-case equivalents.</span>

### System Info Functions

Function &rarr; Returns | Description
--- | ---
<code>array_length(input: anyelement[], array_dimension: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the length of `input` on the provided `array_dimension`. However, because CockroachDB doesn't yet support multi-dimensional arrays, the only supported `array_dimension` is **1**.</span>
<code>array_lower(input: anyelement[], array_dimension: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the minimum value of `input` on the provided `array_dimension`. However, because CockroachDB doesn't yet support multi-dimensional arrays, the only supported `array_dimension` is **1**.</span>
<code>array_upper(input: anyelement[], array_dimension: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the maximum value of `input` on the provided `array_dimension`. However, because CockroachDB doesn't yet support multi-dimensional arrays, the only supported `array_dimension` is **1**.</span>
<code>cluster_logical_timestamp() &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">This function is used only by CockroachDB's developers for testing purposes.</span>
<code>current_schema() &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns the current database.</span>
<code>current_schemas(include_implicit: <a href="bool.html">bool</a>) &rarr; <a href="string.html">string</a>[]</code> | <span class="funcdesc">Returns the current database; optionally include implicit schemas (e.g. `pg_catalog`).</span>
<code>version() &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns the node's version of CockroachDB.</span>

### Compatibility Functions

Function &rarr; Returns | Description
--- | ---
<code>pg_catalog.array_in(<a href="string.html">string</a>: <a href="string.html">string</a>, element_oid: <a href="int.html">int</a>, element_typmod: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.col_description(table_oid: <a href="int.html">int</a>, column_number: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.format_type(type_oid: <a href="int.html">int</a>, typemod: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Returns the SQL name of a data type that is identified by its type OID and possibly a type modifier. Currently, the type modifier is ignored.</span>
<code>pg_catalog.generate_series(start: <a href="int.html">int</a>, end: <a href="int.html">int</a>) &rarr; setof tuple{<a href="int.html">int</a>}</code> | <span class="funcdesc">Produces a virtual table containing the integer values from `start` to `end`, inclusive.</span>
<code>pg_catalog.generate_series(start: <a href="int.html">int</a>, end: <a href="int.html">int</a>, step: <a href="int.html">int</a>) &rarr; setof tuple{<a href="int.html">int</a>}</code> | <span class="funcdesc">Produces a virtual table containing the integer values from `start` to `end`, inclusive, by increment of `step`.</span>
<code>pg_catalog.obj_description(object_oid: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.pg_backend_pid() &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.pg_get_expr(pg_node_tree: <a href="string.html">string</a>, relation_oid: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.pg_get_expr(pg_node_tree: <a href="string.html">string</a>, relation_oid: <a href="int.html">int</a>, pretty_<a href="bool.html">bool</a>: <a href="bool.html">bool</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.pg_get_indexdef(index_oid: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.pg_get_userbyid(role_oid: <a href="int.html">int</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.pg_typeof(val: anyelement) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>pg_catalog.shobj_description(object_oid: <a href="int.html">int</a>, catalog_name: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Not usable; exposed only for ORM compatibility.</span>
<code>unnest(input: <a href="int.html">int</a>[]) &rarr; setof tuple{<a href="int.html">int</a>}</code> | <span class="funcdesc">Returns the input array as a set of rows</span>
<code>unnest(input: <a href="string.html">string</a>[]) &rarr; setof tuple{<a href="string.html">string</a>}</code> | <span class="funcdesc">Returns the input array as a set of rows</span>

