---
title: CockroachDB Docs
summary: CockroachDB user documentation.
type: first_page
homepage: true
toc: false
twitter: false
contribute: false
build_for: both
---

{% if site.managed %}
Managed CockroachDB is a **fully hosted** and **fully managed service** created and owned by Cockroach Labs<br>that **makes deploying, scaling, and managing CockroachDB effortless**.

### Always-On Service for Mission Critical Apps

- Monthly uptime percentage of 99.95%
- Automatically replicate your data across at least three data centers
- Currently available in GCP and AWS

### Run by Distributed SQL Experts

- Reference architectures battle tested and tuned by the makers of CockroachDB
- In-house expertise from former Google SRE team

### Operational Excellence

- Automatic hardware provisioning, setup, and configuration
- Automatic upgrades to the latest stable (or alpha) release of CockroachDB
- Automatic daily full backups and hourly incremental backups

### Enterprise-Grade Security

- TLS 1.2 for all connections and/or VPC peering between networks
- SOC2 compliance in process by Cockroach Labs
- Encryption at Rest by default coming in a future release

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
    <iframe width="560" height="349" src="https://www.youtube.com/embed/91IqMUwAdnc?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>
  </div>
{% endif %}
</div>
