---
title: Releases
summary: Release notes for older versions of CockroachDB.
toc: true
redirect_from: /releases.html
---

After downloading your desired release, learn how to [Install CockroachDB](../stable/install-cockroachdb.html).

{% for section in site.data.releases %}
## {{section.title}}
<div id="os-tabs" class="filters filters-big clearfix">
    <button id="linux" class="filter-button" data-scope="linux">Linux</button>
    <button id="mac" class="filter-button" data-scope="mac">Mac</button>
    <button id="windows" class="filter-button" data-scope="windows">Windows</button>
    <button id="docker" class="filter-button" data-scope="docker">Docker</button>
    <button id="source" class="filter-button" data-scope="source">Source</button>
</div>

<table class="release-table">
<thead>
<tr>
  <td>Version &amp; Release Notes</td>
  <td>Date</td>
  <td>
    <section class="filter-content" data-scope="linux">Precompiled 64-bit Binary</section>
    <section class="filter-content" data-scope="mac">Precompiled 64-bit Binary</section>
    <section class="filter-content" data-scope="windows">Precompiled 64-bit Binary</section>
    <section class="filter-content" data-scope="docker">Docker Image</section>
    <section class="filter-content" data-scope="source">Source Code</section>
  </td>
</tr>
</thead>

<tbody>
{% for release in section.releases %}
    <tr {% if release.latest %}class="latest"{% endif %}>
        <td>
            <a href="{{ release.version }}.html">{{ release.version }}</a>
            {% if release.latest %}
                <span class="badge">Latest</span>
            {% endif %}
        </td>
        <td>{{ release.date }}</td>
        {% if release.withdrawn %}
            <td class="os-release-cell"><span class="badge badge-gray">Withdrawn</span></td>
            <td></td>
        {% else %}
            <td class="os-release-cell">
                <section class="filter-content" data-scope="linux">
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-amd64.tgz">Download</a>
                </section>
                <section class="filter-content" data-scope="mac">
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.darwin-10.9-amd64.tgz">Download</a>
                </section>
                <section class="filter-content" data-scope="windows">
                {% if release.no_windows %}
                    N/A
                {% else %}
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.windows-6.2-amd64.zip">Download</a>
                {% endif %}
                </section>
                <section class="filter-content" data-scope="docker">
                    <code>cockroachdb/cockroach{% if release.testing %}-unstable{% endif %}:{{ release.version }}</code>
                </section>
                <section class="filter-content" data-scope="source">
                {% if release.no_source %}
                    N/A
                {% else %}
                    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.src.tgz">Download</a>
                {% endif %}
                </section>
            </td>
        {% endif %}
    </tr>
{% endfor %}
</tbody>
</table>
{% endfor %}
