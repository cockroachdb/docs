---
title: Technical Advisories
summary: Advisories about important security and stability aspects of CockroachDB.
toc: true
doc_area: 
product_area: 
---

Technical advisories report major issues with CockroachDB that may
impact security or stability in production environments.

Users are invited to evaluate advisories and consider the recommended
mitigation actions independently from their version upgrade schedule.

<table style=>
<colgroup>
<col style="width: 10%">
<col style="width: 50%">
<col style="width: 20%">
<col style="width: 20%">
</colgroup>
<thead>
<tr>
  <th>Advisory</th>
  <th>Summary</th>
  <th>Affected versions</th>
  <th>Date</th>
</tr>
</thead>

<tbody>
{% for advisory in site.data.advisories %}
<tr>
	<td>
		<a href="a{{ advisory.advisory }}.html">A-{{ advisory.advisory }}</a>
	</td>
	<td>{{ advisory.summary }}</td>
	<td>{{ advisory.versions }}</td>
	<td>{{ advisory.date }}</td>
</tr>
{% endfor %}
</tbody>
</table>
