Function &rarr; Returns | Description
--- | ---
<code>array_agg(arg: anyelement) &rarr; anyelement</code> | <span class="funcdesc">Aggregates the selected values into an array.</span>
<code>avg(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the average of the selected values.</span>
<code>avg(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the average of the selected values.</span>
<code>avg(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the average of the selected values.</span>
<code>bool_and(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code> | <span class="funcdesc">Calculates the boolean value of `AND`ing all selected values.</span>
<code>bool_or(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code> | <span class="funcdesc">Calculates the boolean value of `OR`ing all selected values.</span>
<code>concat_agg(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Concatenates all selected values.</span>
<code>concat_agg(arg: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Concatenates all selected values.</span>
<code>count(arg: anyelement) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the number of selected elements.</span>
<code>count_rows() &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the number of rows.</span>
<code>max(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="date.html">date</a>) &rarr; <a href="date.html">date</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="interval.html">interval</a>) &rarr; <a href="interval.html">interval</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="timestamp.html">timestamp</a>) &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: <a href="timestamp.html">timestamptz</a>) &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: oid) &rarr; oid</code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>max(arg: uuid) &rarr; uuid</code> | <span class="funcdesc">Identifies the maximum selected value.</span>
<code>min(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="date.html">date</a>) &rarr; <a href="date.html">date</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="interval.html">interval</a>) &rarr; <a href="interval.html">interval</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="timestamp.html">timestamp</a>) &rarr; <a href="timestamp.html">timestamp</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: <a href="timestamp.html">timestamptz</a>) &rarr; <a href="timestamp.html">timestamptz</a></code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: oid) &rarr; oid</code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>min(arg: uuid) &rarr; uuid</code> | <span class="funcdesc">Identifies the minimum selected value.</span>
<code>stddev(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the standard deviation of the selected values.</span>
<code>stddev(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the standard deviation of the selected values.</span>
<code>stddev(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the standard deviation of the selected values.</span>
<code>sum(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the sum of the selected values.</span>
<code>sum(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the sum of the selected values.</span>
<code>sum(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the sum of the selected values.</span>
<code>sum(arg: <a href="interval.html">interval</a>) &rarr; <a href="interval.html">interval</a></code> | <span class="funcdesc">Calculates the sum of the selected values.</span>
<code>sum_int(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the sum of the selected values.</span>
<code>variance(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the variance of the selected values.</span>
<code>variance(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code> | <span class="funcdesc">Calculates the variance of the selected values.</span>
<code>variance(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code> | <span class="funcdesc">Calculates the variance of the selected values.</span>
<code>xor_agg(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code> | <span class="funcdesc">Calculates the bitwise XOR of the selected values.</span>
<code>xor_agg(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code> | <span class="funcdesc">Calculates the bitwise XOR of the selected values.</span>

