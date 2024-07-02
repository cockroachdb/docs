---
title: Technical Advisories
summary: Advisories about important security and stability aspects of CockroachDB.
toc: true
index: true
docs_area: releases
---

Technical advisories report major issues with CockroachDB or the CockroachDB {{ site.data.products.cloud }} platform that may impact security or stability in production environments.

Users are invited to evaluate advisories and consider the recommended mitigation actions independently from their version upgrade schedule.

Get future technical advisories emailed to you:

{% include_cached marketo.html formId=1085 %}

{% assign advisories = site.pages | where_exp: "advisories", "advisories.path contains 'advisories'" | where_exp: "advisories", "advisories.url != page.url" | sort: "advisory_date" | reverse %}

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

{% for advisory in advisories %}
{% if advisory.summary and advisory.affected_versions and advisory.advisory_date %}
<tr>
	<td>
		<a href="/docs{{ advisory.url }}">{{ advisory.advisory }}</a>
	</td>
	<td>{{ advisory.summary }}</td>
	<td>{{ advisory.affected_versions }}</td>
	<td>{{ advisory.advisory_date | date: "%B %e, %Y" }}</td>
</tr>
{% endif %}
{% endfor %}
</tbody>
</table>
