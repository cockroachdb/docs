---
title: Nick
summary: Nick
toc: true
---

{{ page.version }}

{% assign today = "today" | date: "%Y-%m-%d" | plus: 3 %}

{{ today }}

{% assign s = site.data.releases | map: "release_type" | uniq %}

{% for section in s %}
{{ section }}
{% endfor %}



{% assign today = "today" | date: "%Y-%m-%d" %}
{% assign v = site.data.versions | where_exp: "v", "v.asst_supp_exp_date > today" | where_exp: "v", "v.release_date < today" | sort: "release_date" | reverse %}
{% for x in v %}
{{ x.major_version }}
{% assign r = site.data.releases | where_exp: "r", "r.major_version == x.major_version" | where: "release_type", "Production" | where: "withdrawn", "false" | sort: "date" | last | map: "version" %}
{{ r }}
{% endfor %}


{% assign today = "today" | date: "%Y-%m-%d" %}
{% assign v = site.data.versions | where_exp: "v", "v.asst_supp_exp_date > today" | where_exp: "v", "v.release_date < today" | sort: "release_date" | reverse %}
{% for x in v %}
{{ x.major_version }}
{% assign r = site.data.releases | where_exp: "r", "r.major_version == x.major_version" | where: "release_type", "Production" | where: "withdrawn", "false" | sort: "date" | reverse %}
{% for y in r %}
{{ y }}
{% endfor %}
{% endfor %}
