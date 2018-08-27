---
title: Releases
summary: Release notes for older versions of CockroachDB.
toc: true
redirect_from: /releases.html
---

After downloading your desired release, learn how to [Install CockroachDB](../stable/install-cockroachdb.html).

{% for section in site.data.releases %}
## {{section.title}}
<table class="release-table">
<thead>
<tr>
  <td>Version &amp; Release Notes</td>
  <td>Date</td>
  <td class="os-release-cell">Precompiled 64-bit Binaries</td>
  <td>Source Code</td>
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
                <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-amd64.tgz">
                    <i class="fa fa-linux" aria-hidden="true"></i> Linux
                </a>
                <wbr>
                <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.darwin-10.9-amd64.tgz">
                    <i class="fa fa-apple" aria-hidden="true"></i> Mac
                </a>
                {% unless release.no_windows %}
                    <wbr>
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.windows-6.2-amd64.zip">
                        <i class="fa fa-windows" aria-hidden="true"></i> Windows
                    </a>
                {% endunless %}
            </td>
            <td>
                {% unless release.no_source %}
                <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.src.tgz">
                    <i class="fa fa-file-archive-o" aria-hidden="true"></i> Source
                </a>
                {% endunless %}
            </td>
        {% endif %}
    </tr>
{% endfor %}
</tbody>
</table>
{% endfor %}
