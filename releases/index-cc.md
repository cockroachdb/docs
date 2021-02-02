---
title: CockroachCloud Releases
summary: Release notes for older versions of CockroachCloud.
toc: true
---

<table class="release-table">
  <thead>
    <tr>
      <td>Version</td>
    </tr>
  </thead>
  
  {% for section in site.data.releases-cc %}
    <tbody>
      {% for release in section.releases %}
        <tr> 
          <td>
            <a href="{{ release.link }}.html">{{ release.name }}</a>
            {% if release.latest %}
                <span class="badge">Latest</span>
            {% endif %}
          </td>
        </tr>
      {% endfor %}
    </tbody>
  {% endfor %}
</table>