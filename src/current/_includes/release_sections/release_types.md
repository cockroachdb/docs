#### Major releases

As of 2024, every second major version is an **Innovation release**. For CockroachDB {{ site.data.products.core }}, CockroachDB {{ site.data.products.standard }}, and CockroachDB {{ site.data.products.advanced }}, these releases offer shorter support windows and can be skipped. Innovation releases are required for CockroachDB {{ site.data.products.basic }}.

All other major versions are **Regular releases**, which are required upgrades. These versions offer longer support periods, which, for CockroachDB {{ site.data.products.core }} clusters, are further extended when a patch version is announced that begins their **LTS** (Long-Term Support) release series.

For details on how LTS impacts support in CockroachDB {{ site.data.products.core }}, refer to [Release Support Policy]({% link releases/release-support-policy.md %}). For details on support per release type in CockroachDB Cloud, refer to [CockroachDB Cloud Support and Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

| Major Release Type | Frequency | Required upgrade | LTS releases and extended support |
| :---: | :---: | :---: | :---: |
| Regular (e.g. v24.1) | 2x/year | Yes | Yes |
| Innovation (e.g. v24.2) | 2x/year | on Basic only | No<sup style="font-size: 0.9em; vertical-align: -0.3em;">*</sup> |
<small>* Column does not apply to CockroachDB Basic, where clusters are automatically upgraded when a new major version or a patch release is available, ensuring continuous support.</small>

For a given CockroachDB {{ site.data.products.core }}, CockroachDB {{ site.data.products.standard }}, or CockroachDB {{ site.data.products.advanced }} cluster, customers may choose to exclusively install or upgrade to Regular Releases to benefit from longer testing and support lifecycles, or to also include Innovation Releases, and benefit from earlier access to new features. This choice does not apply to CockroachDB {{ site.data.products.basic }}, where every major release is an automatic upgrade.

CockroachDB v24.2 is an Innovation release and v24.3 is a Regular release. Starting with v25.1, four major releases are expected per year, where every first and third release of the year is expected to be an Innovation release. For more details, refer to [Upcoming releases](#upcoming-releases).

#### Patch releases

A major version has two types of patch releases: a series of **testing releases** followed by a series of **production releases**. A major version’s initial production release is also known as its GA release.

<style>
  .no-wrap-table td:nth-child(1) {
    width: 140px; /* Set width for the first column */
    white-space: nowrap; /* Prevent wrapping */
  }
  .no-wrap-table td:nth-child(2) {
    width: 200px; /* Set width for the second column */
    white-space: nowrap; /* Prevent wrapping */
  }
</style>

<table class="no-wrap-table">
  <thead>
    <tr>
      <th>Patch Release Type</th>
      <th>Naming</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Production</td>
      <td><code>vYY.R.0</code> - <code>vYY.R.n</code><br>(ex. v24.2.1)</td>
      <td>Production releases are qualified for production environments. The type and duration of support for a production release may vary depending on the major release type, according to the <a href="release-support-policy.html">Release Support Policy</a>.</td>
    </tr>
    <tr>
      <td>Testing</td>
      <td><code>vYY.R.0-alpha.1+</code>,<br><code>vYY.R.0-beta.1+</code>,<br><code>vYY.R.0-rc.1+</code><br>(ex. v24.3.1-alpha.2)</td>
      <td>Produced during development of a new major version, testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments.</td>
    </tr>
  </tbody>
</table>

{{site.data.alerts.callout_danger}}
A cluster that is upgraded to an alpha binary of CockroachDB or a binary that was manually built from the `master` branch cannot subsequently be upgraded to a production release.
{{site.data.alerts.end}}