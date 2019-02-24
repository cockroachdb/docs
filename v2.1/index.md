---
title: CockroachDB Docs
summary: CockroachDB user documentation.
toc: true
contribute: false
build_for: [standard, managed]
---

{% if site.managed %}
Managed CockroachDB is a fully hosted and fully managed service created and owned by Cockroach Labs that makes deploying, scaling, and managing CockroachDB effortless.

{{site.data.alerts.callout_info}}
These docs are a work in progress. Please reach out to [support.cockroachlabs.com](https://support.cockroachlabs.com) if you have questions not yet answered here.
{{site.data.alerts.end}}

### Always-On Service

- Cloud vendor agnostic
- Automatic data replication across 3+ data centers
- Zero downtime migration between cloud providers

### Operational Excellence

- Automatic hardware provisioning, setup, and configuration
- Automatic rolling upgrades
- Automated daily backups and hourly incremental backups

### Enterprise-Grade Security

- TLS 1.2 for all connections
- Single tenant clusters
- SOC-2 Compliance (in process)

{% else %}

<style>
.content-col {
  width: 100%;
}

.row {
  margin-left: 0px;
  margin-right: 0px;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

.column {
  float: left;
  width: 30%;
  margin: 5px;
  <!-- box-shadow: 0 2px 5px 0 rgba(17,29,57,0.1), 0 4px 20px 0 rgba(17,29,57,0.12); -->
}

.column-title {
  font-family: 'Graphik-Semibold', sans-serif;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  padding-top: 20px;
  padding-bottom: 10px;
}

.column-content {
  padding-left: 25px;
  padding-right: 25px;
  padding-bottom: 20px;
}

.column-content p {
  line-height: 25px;
}

@media screen and (max-width: 600px) {
  .column {
    width: 100%;
  }
}
</style>

CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.

<div class="row">
  <div class="column">
    <div class="column-content">
      <!-- <h3>Get Started</h3> -->
      <p class="column-title">Get Started</p>
        <p><a href="frequently-asked-questions.html">What is CockroachDB?</a></p>      
        <p><a href="install-cockroachdb.html">Install CockroachDB</a></p>
        <p><a href="start-a-local-cluster.html">Start a Local Cluster</a></p>
        <p><a href="learn-cockroachdb-sql.html">Learn CockroachDB SQL</a></p>
        <p><a href="build-an-app-with-cockroachdb.html">Build an App</a></p>
    </div>
  </div>
  <div class="column">
    <div class="column-content">
      <!-- <h3>Develop</h3> -->
      <p class="column-title">Develop</p>
        <p><a href="install-client-drivers.html">Client Drivers</a></p>
        <p><a href="connection-parameters.html">Connection Parameters</a></p>
        <p><a href="sql-statements.html">SQL Statements</a></p>
        <p><a href="data-types.html">Data Types</a></p>
        <p><a href="performance-best-practices.html">SQL Best Practices</a></p>
    </div>
  </div>
  <div class="column">
    <div class="column-content">
      <!-- <h3>Deploy</h3> -->
      <p class="column-title">Deploy</p>
        <p><a href="recommended-production-settings.html">Production Checklist</a></p>
        <p><a href="manual-deployment.html">Manual Deployment</a></p>
        <p><a href="orchestrated-deployment.html">Orchestration</a></p>
        <p><a href="security-overview.html">Security</a></p>
        <p><a href="upgrade-cockroach-version.html">Rolling Upgrade</a></p>
    </div>
  </div>
</div>
<div class="row">  
  <div class="column">
    <div class="column-content">
      <p class="column-title">Migrate</p>
        <p><a href="migration-overview.html">Overview</a></p>
        <p><a href="migrate-from-postgres.html">Migrate from Postgres</a></p>
        <p><a href="migrate-from-mysql.html">Migrate from MySQL</a></p>
        <p><a href="migrate-from-csv.html">Migrate from CSV</a></p>
        <p><a href="performance-best-practices-overview.html#multi-row-dml-best-practices">Insert Best Practices</a></p>
    </div>
  </div>
  <div class="column">
    <div class="column-content">
      <p class="column-title">Troubleshoot</p>
        <p><a href="common-errors.html">Overview</a></p>
        <p><a href="common-errors.html">Common Errors</a></p>
        <p><a href="cluster-setup-troubleshooting.html">Cluster Setup</a></p>
        <p><a href="query-behavior-troubleshooting.html">Query Behavior</a></p>
        <p><a href="support-resources.html">Support Resources</a></p>
    </div>
  </div>
  <div class="column">
    <div class="column-content">
      <p class="column-title">Reference</p>
        <p><a href="client-drivers.html">SQL</a></p>
        <p><a href="cockroach-commands.html">CLI</a></p>
        <p><a href="cluster-settings.html">Cluster Settings</a></p>
        <p><a href="admin-ui-overview.html">Admin UI</a></p>
        <p><a href="third-party-database-tools.html">Third-Party Tools</a></p>
    </div>
  </div>
</div>
<div class="row">
  <div class="column">
    <div class="column-content">
      <p class="column-title">Learn More</p>
        <p><a href="architecture/overview.html">Architecture</a></p>
        <p><a href="demo-fault-tolerance-and-recovery.html">Capabilities</a></p>
        <p><a href="sql-feature-support.html">SQL Feature Support</a></p>
        <p><a href="https://www.cockroachlabs.com/guides/">Whitepapers</a></p>
    </div>
  </div>
  <div class="column">
    <div class="column-content">
      <p class="column-title">FAQs</p>
        <p><a href="frequently-asked-questions.html">Product FAQs</a></p>
        <p><a href="sql-faqs.html">SQL FAQs</a></p>
        <p><a href="operational-faqs.html">Operational FAQs</a></p>
        <p><a href="cockroachdb-in-comparison.html">DB Comparisons</a></p>
    </div>
  </div>
  <div class="column">
    <div class="column-content">
      <p class="column-title">Releases</p>
        <p><a href="../releases/{{page.release_info.version}}.html">Latest Stable Release</a></p>
        <p><a href="../releases/#production-releases">All Stable Releases</a></p>
        <p><a href="../releases/#testing-releases">All Testing Releases</a></p>
        <p><a href="known-limitations.html">Known Limitations</a></p>
    </div>
  </div>
</div>

{% endif %}
