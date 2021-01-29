---
title: SQL Grammar
summary: The full SQL grammar for CockroachDB.
toc: false
back_to_top: true
---

<style>
/* TODO(mjibson): reduce to header height once it no longer changes on scroll */
a[name]::before {
	content: '';
	display: block;
	height: 80px;
	margin: -80px 0 0;
}
a[name]:focus {
	outline: 0;
}
</style>

{{site.data.alerts.callout_success}}
This page describes the full CockroachDB SQL grammar. However, as a starting point, it's best to reference our <a href="sql-statements.html">SQL statements pages</a> first, which provide detailed explanations and examples.
{{site.data.alerts.end}}

{% comment %}
TODO: clean up the SQL diagrams not to link to these missing nonterminals.
{% endcomment %}
<a id="col_label"></a>
<a id="column_constraints"></a>
<a id="column_name"></a>
<a id="fk_column_name"></a>
<a id="interleave_prefix"></a>
<a id="limit_val"></a>
<a id="offset_val"></a>
<a id="ref_column_name"></a>
<a id="timestamp"></a>

<div class="horizontal-scroll">
  {% include {{ page.version.version }}/sql/diagrams/grammar.html %}
</div>
