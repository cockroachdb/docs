{% comment %}

The filter-tabs.md file is used to create a filter bar at the top of the page to navigate to different but related URLs/.md files. This is useful in scenarios such as toggling between different Ruby tutorials in different URLs.

To generate the filter bar in a specific location within a document, place the following liquid block in its own line in the locatino of the document you wish to put it:

{% include filter-tabs.md %}

In order to properly utilize this file, the following three items must be added to the YAML front matter of each page to be filtered:

filter_category: The name of the group of filter tabs. For instance, all filter tabs within the Ruby tutorials use crud_ruby as the filter category.
filter_html: The HTML of the text to be used for that page's tab in the filter.
filter_sort: The sort order of that particular page's tab in the filter. If this value is accidentally set to be the same across two or more pages, those pages will be sorted by alphabetical order of their file name.
{% endcomment %}

{% assign fpage = site.pages | where: "filter_category", page.filter_category | where_exp: "p", "p.version.version == page.version.version" | sort: "filter_sort" %}

<div class="filters clearfix">
    {% for x in fpage %}
    <a href="/docs{{ x.url }}"><button class="filter-button{% if x.url == page.url %} current{% endif %}">{{ x.filter_html }}</button></a>
    {% endfor %}
</div>
