---
title: CockroachDB Docs
summary: CockroachDB documentation with details on installation, getting started, building an app, deployment, orchestration, and more.
tags: install, build an app, deploy
type: first_page
homepage: true
toc: false
no_toc: true
twitter: false
contribute: false
---

<div class="landing-page">
{% if page.build_for_managed %}
Cockroach Cloud is a fully-managed cloud database developed by the same people that build CockroachDB. Cockroach Cloud handles all the complexity of deploying, managing, and healing your deployments on the cloud service provider of your choice (AWS, Azure, and GCP). Follow the links below to get started.
{% else %}
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
