---
title: Archived Documentation
summary: Documentation for CockroachDB versions that are no longer actively maintained

toc: false          # hide “On this page” nav
docs_area: releases
---

<!-- ✨ page-level style overrides -->
<style>
/* headline spacing */
h1 { margin-bottom: 1.75rem; }

/* section heading spacing */
h2 { margin-top: 3rem; margin-bottom: 1.25rem; }

/* selector card */
.archived-card {
  background: #f6f7f8;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  padding: 1.5rem 1.75rem 2rem;
}
/* spacing inside selector card */
.archived-card label   { display:block; font-weight:600; margin-bottom:.5rem; }
.archived-card select  { width:100%; font-size:1rem; padding:.65rem .75rem; }
.archived-card button  { width:100%; margin-top:1.25rem; }

/* primary button (CRDB purple) */
button.button-primary,
button.button-primary:visited {
  background:#6933ff;
  color:#fff;
  font-weight:500;
  border:0;
  border-radius:4px;
  padding:.65rem 1rem;
}
button.button-primary:hover { background:#5f30e2; }

/* table styling */
table { width:100%; border-collapse:collapse; margin-top:1rem; }
th, td { padding:.75rem 1rem; text-align:left; }
thead th { background:#f6f7f8; font-weight:600; }
tbody tr:nth-child(even) { background:#fafafa; }

/* status pill */
.version-pill { border-radius:12px; padding:.2rem .65rem; font-size:.75rem; font-weight:500; }
.version-archived { background:#fde6e2; color:#b53b1b; }

/* download links */
.download-link { color:#6933ff; font-weight:500; text-decoration:none; }
.download-link:hover { text-decoration:underline; }
</style>

Access documentation for previous versions of CockroachDB that are no longer actively maintained.

{{ site.data.alerts.callout_info }}
CockroachDB recommends using the most recent version for the best experience and most up-to-date documentation. Archived documentation is provided **as-is** and is no longer actively maintained.
{{ site.data.alerts.end }}

## Select a Version
Choose a version to view its archived documentation:

<div class="archived-card" markdown="1">
<label for="version-select">Version:</label>
<select id="version-select" class="filter-select">
  <option value="" disabled selected>Select a version</option>
  <optgroup label="Major Releases">
    <option value="v21.2">v21.2 (Archived)</option>
    <option value="v21.1">v21.1 (Archived)</option>
    <option value="v20.2">v20.2 (Archived)</option>
    <option value="v20.1">v20.1 (Archived)</option>
    <option value="v19.2">v19.2 (Archived)</option>
  </optgroup>
  <optgroup label="Legacy Releases">
    <option value="v19.1">v19.1 (Archived)</option>
    <option value="v2.1">v2.1 (Archived)</option>
    <option value="v2.0">v2.0 (Archived)</option>
    <option value="v1.1">v1.1 (Archived)</option>
    <option value="v1.0">v1.0 (Archived)</option>
  </optgroup>
</select>

<button type="button" class="button-primary">View Documentation</button>
</div>

## All Archived Versions
Browse the full list of archived CockroachDB versions:

<div class="wide-overflow" markdown="1">

<table>
  <thead>
    <tr><th>Version</th><th>Release Date</th><th>EOL Date</th><th>Status</th><th>Downloads</th></tr>
  </thead>
  <tbody>
    <tr><td><strong>v21.2</strong></td><td>November 2021</td><td>March 2023</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v21.1</strong></td><td>May 2021</td><td>November 2022</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v20.2</strong></td><td>November 2020</td><td>May 2022</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v20.1</strong></td><td>May 2020</td><td>November 2021</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v19.2</strong></td><td>November 2019</td><td>May 2021</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v19.1</strong></td><td>May 2019</td><td>November 2020</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v2.1</strong></td><td>November 2018</td><td>May 2020</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v2.0</strong></td><td>April 2018</td><td>November 2019</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v1.1</strong></td><td>October 2017</td><td>April 2019</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
    <tr><td><strong>v1.0</strong></td><td>May 2017</td><td>October 2018</td>
        <td><span class="version-pill version-archived">Archived</span></td>
        <td><a href="#" class="download-link">ZIP</a>&nbsp;<a href="#" class="download-link">PDF</a></td></tr>
  </tbody>
</table>

</div>

## Looking for Current Documentation?
Visit our [current documentation](/docs/stable/) for the latest CockroachDB versions.
