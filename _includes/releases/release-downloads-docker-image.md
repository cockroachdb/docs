{% assign release = site.data.releases | where_exp: "release", "release.version == include.release" | first %}
{% assign version = site.data.versions | where_exp: "version", "version.major_version == release.major_version" | first %}

{% if release.withdrawn == "true" %}
<h3 id="{{ release.version | downcase | replace: ".", "-" }}-downloads">Downloads</h3>
{{site.data.alerts.callout_danger}}
This patch release has been withdrawn{% if include.advisory_key %} due to [this technical advisory](../advisories/{{ include.advisory_key }}.html){% endif %}. All the changes listed as part of this release will be in the next release. Do not upgrade to this release.
{{site.data.alerts.end}}

<h3 id="{{ release.version | downcase | replace: ".", "-" }}-docker-image">Docker image</h3>

{{site.data.alerts.callout_danger}}
This release was withdrawn, and we've removed the links to the downloads and Docker image.
{{site.data.alerts.end}}
{% else %}
<h3 id="{{ release.version | downcase | replace: ".", "-" }}-downloads">Downloads</h3>

<div><div id="os-tabs" class="filters clearfix">
    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-amd64.tgz"><button id="linux" class="filter-button" data-scope="linux" data-eventcategory="linux-binary-release-notes">Linux</button></a>
    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.darwin-10.9-amd64.tgz"><button id="mac" class="filter-button" data-scope="mac" data-eventcategory="mac-binary-release-notes">Mac</button></a>
    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.windows-6.2-amd64.zip"><button id="windows" class="filter-button" data-scope="windows" data-eventcategory="windows-binary-release-notes">Windows</button></a>
    <a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ release.version }}"><button id="source" class="filter-button" data-scope="source" data-eventcategory="source-release-notes">Source</button></a
</div></div>

<section class="filter-content" data-scope="windows">
{% include_cached windows_warning.md %}
</section>

{% if release.release_type == "Testing" %}{% include releases/experimental-test-release.md %}{% endif %}

<h3 id="{{ release.version | downcase | replace: ".", "-" }}-docker-image">Docker image</h3>

{% include_cached copy-clipboard.html %}
~~~shell
$ docker pull {{ release.docker_image }}:{{ release.version }}
~~~
{% endif %}
