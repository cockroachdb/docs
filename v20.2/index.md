---
title: CockroachDB Docs
summary: CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.
toc: true
homepage: true
contribute: false
cta: false
---

{% if site.cockroachcloud %}
CockroachCloud is a fully hosted and fully managed service created and owned by Cockroach Labs that makes deploying, scaling, and managing CockroachDB effortless.

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

CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.

<div class="container">
  <div class="row display-flex">
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Get Started</p>
      <div class="landing-column-content">
        <p><a href="https://university.cockroachlabs.com/catalog">Online Training</a></p>
        <p><a href="install-cockroachdb.html">Install CockroachDB</a></p>
        <p><a href="start-a-local-cluster.html">Start a Local Cluster</a></p>
        <p><a href="learn-cockroachdb-sql.html">Learn CockroachDB SQL</a></p>
        <p><a href="build-an-app-with-cockroachdb.html">Hello, World!</a></p>
        <p><a href="demo-fault-tolerance-and-recovery.html">Explore Capabilities</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Develop</p>
      <div class="landing-column-content">
        <p><a href="install-client-drivers.html">Client Drivers</a></p>
        <p><a href="connection-parameters.html">Connection Parameters</a></p>
        <p><a href="performance-best-practices-overview.html">SQL Best Practices</a></p>
        <p><a href="sql-statements.html">SQL Statements</a></p>
        <p><a href="data-types.html">SQL Data Types</a></p>
        <p><a href="sql-tuning-with-explain.html">SQL Tuning</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Deploy</p>
      <div class="landing-column-content">
        <p><a href="recommended-production-settings.html">Production Checklist</a></p>
        <p><a href="topology-patterns.html">Topology Patterns</a></p>
        <p><a href="manual-deployment.html">Manual Deployment</a></p>
        <p><a href="orchestration.html">Orchestration</a></p>
        <p><a href="performance.html">Performance</a></p>
        <p><a href="upgrade-cockroach-version.html">Rolling Upgrade</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Migrate</p>
      <div class="landing-column-content">
        <p><a href="migration-overview.html">Overview</a></p>
        <p><a href="migrate-from-oracle.html">Migrate from Oracle</a></p>
        <p><a href="migrate-from-postgres.html">Migrate from Postgres</a></p>
        <p><a href="migrate-from-mysql.html">Migrate from MySQL</a></p>
        <p><a href="migrate-from-csv.html">Migrate from CSV</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Troubleshoot</p>
      <div class="landing-column-content">
        <p><a href="common-errors.html">Overview</a></p>
        <p><a href="common-errors.html">Common Errors</a></p>
        <p><a href="cluster-setup-troubleshooting.html">Cluster Setup</a></p>
        <p><a href="query-behavior-troubleshooting.html">Query Behavior</a></p>
        <p><a href="support-resources.html">Support Resources</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Reference</p>
      <div class="landing-column-content">
        <p><a href="sql-feature-support.html">SQL</a></p>
        <p><a href="cockroach-commands.html">CLI</a></p>
        <p><a href="cluster-settings.html">Cluster Settings</a></p>
        <p><a href="ui-overview.html">DB Console</a></p>
        <p><a href="third-party-database-tools.html">Third-Party Tools</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Learn More</p>
      <div class="landing-column-content">
        <p><a href="architecture/overview.html">Architecture</a></p>
        <p><a href="sql-feature-support.html">SQL Feature Support</a></p>
        <p><a href="https://www.cockroachlabs.com/guides/">Whitepapers</a></p>
        <p><a href="https://www.cockroachlabs.com/community/tech-talks/">Videos & Webinars</a></p>
        <p><a href="cockroachdb-in-comparison.html">DB Comparisons</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">FAQs</p>
      <div class="landing-column-content">
        <p><a href="frequently-asked-questions.html">Product FAQs</a></p>
        <p><a href="sql-faqs.html">SQL FAQs</a></p>
        <p><a href="operational-faqs.html">Operational FAQs</a></p>
        <p><a href="operational-faqs.html">Availability FAQs</a></p>        
        <p><a href="licensing-faqs.html">Licensing FAQs</a></p>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-4">
      <p class="landing-column-title">Releases</p>
      <div class="landing-column-content">
        <p><a href="../releases/{{page.release_info.version}}.html">Latest Stable Release</a></p>
        <p><a href="../releases/#production-releases">All Stable Releases</a></p>
        <p><a href="../releases/#testing-releases">All Testing Releases</a></p>
        <p><a href="known-limitations.html">Known Limitations</a></p>
      </div>
    </div>
  </div>
</div>
{% endif %}
