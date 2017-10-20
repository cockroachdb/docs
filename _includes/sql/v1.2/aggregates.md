<table>
<thead><tr><th>Function &rarr; Returns</th><th>Description</th></tr></thead>
<tbody>
<tr><td><code>array_agg(arg: anyelement) &rarr; anyelement</code></td><td><span class="funcdesc"><p>Aggregates the selected values into an array.</p>
</span></td></tr>
<tr><td><code>avg(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the average of the selected values.</p>
</span></td></tr>
<tr><td><code>avg(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code></td><td><span class="funcdesc"><p>Calculates the average of the selected values.</p>
</span></td></tr>
<tr><td><code>avg(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the average of the selected values.</p>
</span></td></tr>
<tr><td><code>bool_and(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code></td><td><span class="funcdesc"><p>Calculates the boolean value of <code>AND</code>ing all selected values.</p>
</span></td></tr>
<tr><td><code>bool_or(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code></td><td><span class="funcdesc"><p>Calculates the boolean value of <code>OR</code>ing all selected values.</p>
</span></td></tr>
<tr><td><code>concat_agg(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code></td><td><span class="funcdesc"><p>Concatenates all selected values.</p>
</span></td></tr>
<tr><td><code>concat_agg(arg: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code></td><td><span class="funcdesc"><p>Concatenates all selected values.</p>
</span></td></tr>
<tr><td><code>count(arg: anyelement) &rarr; <a href="int.html">int</a></code></td><td><span class="funcdesc"><p>Calculates the number of selected elements.</p>
</span></td></tr>
<tr><td><code>count_rows() &rarr; <a href="int.html">int</a></code></td><td><span class="funcdesc"><p>Calculates the number of rows.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="date.html">date</a>) &rarr; <a href="date.html">date</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="interval.html">interval</a>) &rarr; <a href="interval.html">interval</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="timestamp.html">timestamp</a>) &rarr; <a href="timestamp.html">timestamp</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="timestamp.html">timestamptz</a>) &rarr; <a href="timestamp.html">timestamptz</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: <a href="uuid.html">uuid</a>) &rarr; <a href="uuid.html">uuid</a></code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>max(arg: oid) &rarr; oid</code></td><td><span class="funcdesc"><p>Identifies the maximum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="bool.html">bool</a>) &rarr; <a href="bool.html">bool</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="date.html">date</a>) &rarr; <a href="date.html">date</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="interval.html">interval</a>) &rarr; <a href="interval.html">interval</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="string.html">string</a>) &rarr; <a href="string.html">string</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="timestamp.html">timestamp</a>) &rarr; <a href="timestamp.html">timestamp</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="timestamp.html">timestamptz</a>) &rarr; <a href="timestamp.html">timestamptz</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: <a href="uuid.html">uuid</a>) &rarr; <a href="uuid.html">uuid</a></code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>min(arg: oid) &rarr; oid</code></td><td><span class="funcdesc"><p>Identifies the minimum selected value.</p>
</span></td></tr>
<tr><td><code>stddev(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the standard deviation of the selected values.</p>
</span></td></tr>
<tr><td><code>stddev(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code></td><td><span class="funcdesc"><p>Calculates the standard deviation of the selected values.</p>
</span></td></tr>
<tr><td><code>stddev(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the standard deviation of the selected values.</p>
</span></td></tr>
<tr><td><code>sum(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the sum of the selected values.</p>
</span></td></tr>
<tr><td><code>sum(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code></td><td><span class="funcdesc"><p>Calculates the sum of the selected values.</p>
</span></td></tr>
<tr><td><code>sum(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the sum of the selected values.</p>
</span></td></tr>
<tr><td><code>sum(arg: <a href="interval.html">interval</a>) &rarr; <a href="interval.html">interval</a></code></td><td><span class="funcdesc"><p>Calculates the sum of the selected values.</p>
</span></td></tr>
<tr><td><code>sum_int(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code></td><td><span class="funcdesc"><p>Calculates the sum of the selected values.</p>
</span></td></tr>
<tr><td><code>variance(arg: <a href="decimal.html">decimal</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the variance of the selected values.</p>
</span></td></tr>
<tr><td><code>variance(arg: <a href="float.html">float</a>) &rarr; <a href="float.html">float</a></code></td><td><span class="funcdesc"><p>Calculates the variance of the selected values.</p>
</span></td></tr>
<tr><td><code>variance(arg: <a href="int.html">int</a>) &rarr; <a href="decimal.html">decimal</a></code></td><td><span class="funcdesc"><p>Calculates the variance of the selected values.</p>
</span></td></tr>
<tr><td><code>xor_agg(arg: <a href="bytes.html">bytes</a>) &rarr; <a href="bytes.html">bytes</a></code></td><td><span class="funcdesc"><p>Calculates the bitwise XOR of the selected values.</p>
</span></td></tr>
<tr><td><code>xor_agg(arg: <a href="int.html">int</a>) &rarr; <a href="int.html">int</a></code></td><td><span class="funcdesc"><p>Calculates the bitwise XOR of the selected values.</p>
</span></td></tr></tbody>
</table>

