{% comment %}
In order to properly utilize this file, the following three items must be added to the YAML front matter of each page:

filter_category: The name of the group of pages where the filter will be applied. This can be anything you want, but all pages that utilize the same filter must be set to the same filter_category.
filter_html: The HTML of the text to be used for that page's tab in the filter.
filter_sort: The sort order of that particular page's tab in the filter.
{% endcomment %}

{% assign fpage = site.pages | where: "filter_category", page.filter_category | where_exp: "p", "p.version.version == page.version.version" | sort: "filter_sort" %}

<div class="filters filters-big clearfix">
    {% for x in fpage %}
    <a href="/docs{{ x.url }}"><button class="filter-button{% if x.url == page.url %} current{% endif %}">{{ x.filter_html }}</button></a>
    {% endfor %}
</div>
