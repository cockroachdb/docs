---
title: DO NOT MERGE
summary: DO NOT MERGE ME. THIS IS A TEST PAGE MEANT TO SHOW CANONICALS.
---

page_name,page_canonical
{% for page in site.pages %}
https://www.cockroachlabs.com{{ site.baseurl }}{{ page.url }},https://www.cockroachlabs.com{{ site.baseurl }}{{ page.canonical }}
{% endfor %}
