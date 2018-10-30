---
title: CockroachDB Docs
summary: CockroachDB user documentation.
type: first_page
homepage: true
toc: true
twitter: false
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
<div class="landing-page">
CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.
  <div class="landing-page__tutorial">
    <a class="landing-page__tutorial--tile install" href="install-cockroachdb.html">
      <i class="landing-page__tutorial--tile-icon"></i>
      <span class="landing-page__tutorial--tile-label"></span>
    </a>
    <a class="landing-page__tutorial--tile start-cluster" href="start-a-local-cluster.html">
      <i class="landing-page__tutorial--tile-icon"></i>
      <span class="landing-page__tutorial--tile-label"></span>
    </a>
    <a class="landing-page__tutorial--tile build-app" href="build-an-app-with-cockroachdb.html">
      <i class="landing-page__tutorial--tile-icon"></i>
      <span class="landing-page__tutorial--tile-label"></span>
    </a>
  </div>
  <div class="landing-page__video-wrapper">
    <iframe width="560" height="349" src="https://www.youtube.com/embed/91IqMUwAdnc?rel=0" frameborder="0" allowfullscreen></iframe>
  </div>
</div>
{% endif %}
