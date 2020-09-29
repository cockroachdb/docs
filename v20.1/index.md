---
title: CockroachDB Docs
summary: CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.
toc: true
homepage: true
contribute: false
build_for: [cockroachdb, cockroachcloud]
cta: false
---

<div class="home-header mb-5" style="height:350px;background: linear-gradient(102.66deg, #37A806 33.41%, #0788FF 106.55%);
">
  <div class="p-lg-5">
  <h1 class="m-0 text-white">Documentation</h1>
  <p class="mt-0 pb-4 text-white">CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.</p>
    <div class="row d-lg-flex">
      <div class="col-lg-4">
        <div class="card card-link h-100">
        <a href="#">
          <div class="card-body p-4">
            <img src="{{ 'images/lightning.svg' | relative_url }}"/>
            <h3 class="m-0 mt-3">Getting started</h3>
            <h4 class="mt-0 text-gray-500">Learn how to install CockroachDB, start a cluster locally, and interact with it via the built-in SQL client.</h4>
          </div>
          </a>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card card-link h-100">
        <a href="#">
          <div class="card-body p-4">
          <img src="{{ 'images/browser-code-alt.svg' | relative_url }}"/>
            <h3 class="m-0 mt-3">Sample applications</h3>
            <h4 class="mt-0 text-gray-500"">Lorem ipsum dolor sit amet cons ectetur adipiscing elit. Gravida eget vestibulum proin aliquam.</h4>
          </div>
          </a>
        </div>
        </div>
      <div class="col-lg-4">
        <div class="card card-link h-100">
        <a href="#">
          <div class="card-body p-4">
          <img src="{{ 'images/partly-cloudy.svg' | relative_url }}"/>
            <h3 class="m-0 mt-3">Deploy with CockroachCloud</h3>
            <h4 class="mt-0 text-gray-500"">Lorem ipsum dolor sit amet cons ectetur adipiscing elit. Gravida eget vestibulum proin aliquam.</h4>
          </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="row pt-4">
<div class="col-lg-8">
<h1 class="mb-0">What is CockroachDB?</h1>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras quis facilisis eget nibh consectetur. Ultrices eu dictumst pulvinar est scelerisque euismod. Convallis turpis interdum at varius. Lobortis nibh turpis blandit nunc. At consectetur feugiat at pellentesque est cras. Et vel, mauris velit nibh sodales in commodo velit.</p>
<a class="btn btn-redirect" href="#">Try CockroachDB <img class="m-0" src="{{ 'images/arrow-left.svg' | relative_url }}"/></a>
</div>
</div>

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

<h2 class="mb-0">Recommended articles</h2>

<div class="container">
  <div class="row display-flex">
    <div class="col-xs-12 col-sm-6 col-lg-3">
      <h3 class="">Get Started</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="https://university.cockroachlabs.com/catalog">Online Training</a></li>
        <li><a href="install-cockroachdb.html">Install CockroachDB</a></li>
        <li><a href="start-a-local-cluster.html">Start a Local Cluster</a></li>
        <li><a href="learn-cockroachdb-sql.html">Learn CockroachDB SQL</a></li>
        <li><a href="build-an-app-with-cockroachdb.html">Hello, World!</a></li>
        <li><a href="demo-fault-tolerance-and-recovery.html">Explore Capabilities</a></li>
        </ul>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-3">
      <h3 class="">Develop</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="install-client-drivers.html">Client Drivers</a></li>
        <li><a href="connection-parameters.html">Connection Parameters</a></li>
        <li><a href="performance-best-practices-overview.html">SQL Best Practices</a></li>
        <li><a href="sql-statements.html">SQL Statements</a></li>
        <li><a href="data-types.html">SQL Data Types</a></li>
        <li><a href="sql-tuning-with-explain.html">SQL Tuning</a></li>
        </ul>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-3">
      <h3 class="">Deploy</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="recommended-production-settings.html">Production Checklist <span class="badge-new">NEW</span></a></li>
        <li><a href="topology-patterns.html">Topology Patterns</a></li>
        <li><a href="manual-deployment.html">Manual Deployment</a></li>
        <li><a href="orchestration.html">Orchestration</a></li>
        <li><a href="performance.html">Performance</a></li>
        <li><a href="upgrade-cockroach-version.html">Rolling Upgrade</a></li>
        </ul>
      </div>
    </div>
    <div class="col-xs-12 col-sm-6 col-lg-3">
      <h3 class="">Migrate</h3>
      <div class="landing-column-content">
      <ul>
        <li><a href="migration-overview.html">Overview</a></li>
        <li><a href="migrate-from-oracle.html">Migrate from Oracle</a></li>
        <li><a href="migrate-from-postgres.html">Migrate from Postgres</a></li>
        <li><a href="migrate-from-mysql.html">Migrate from MySQL</a></li>
        <li><a href="migrate-from-csv.html">Migrate from CSV</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>

<h2 class="mb-0">What’s new in docs</h2>

<div class="row">
    <div class="col-lg-8">
    <div class="row mb-3">
      <div class="col-lg-2 text-gray-500 border-bottom">June 25, 2020</div>
      <div class="col-lg-8 border-bottom">
        <div><p class="font-weight-bold m-0 ">Enterprise edition changes</p></div>
        <div class="text-gray-600 pb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam dignissim et mattis <a href="#">scelerisque donec</a> habitasse ut hac. Eget.</div>
      </div>
    </div>
    
    <div class="row mb-3">
      <div class="col-lg-2 text-gray-500 border-bottom">June 25, 2020</div>
      <div class="col-lg-8 border-bottom">
        <div><p class="font-weight-bold m-0 ">Enterprise edition changes</p></div>
        <div class="text-gray-600 pb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam dignissim et mattis <a href="#">scelerisque donec</a> habitasse ut hac. Eget.</div>
      </div>
    </div>

  </div>
</div>
<a class="btn btn-outline-secondary" href="#">See all the latest</a>

<div class="row pt-5">
  <div class="col-lg-12 text-center mb-5">
    <div class="card shadow position-relative alert alert-dismissable">
      <a
        class="close close-card position-absolute"
        href=""
        data-dismiss="alert"
        aria-label="Close"
        ><img class="m-0" src="{{ 'images/icon-cancel.svg' | relative_url }}"
      /></a>
      <div class="card-body p-5 text-white bg-blackk-texture-logo m-3">
        <p
          class="d-inline-block rounded py-1 px-3 caption-sm m-0 bg-white-transparent text-white font-weight-bold"
        >
          Learning Resources
        </p>
        <h1 class="m-0 text-white">Cockroach University</h1>
        <h4 class="mt-0 pb-3">
          Free online learning platform covering distributed databases,
          cloud-native <br />applications, general purpose SQL databases & moch
          more!
        </h4>
        <a class="btn btn-redirect mb-3" href="#"
          >Start free course
          <img class="m-0" src="{{ 'images/arrow-left.svg' | relative_url }}"
        /></a>
      </div>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-lg-12">
    <div class="card shadow position-relative alert alert-dismissable">
      <a
        class="close close-card position-absolute"
        href="#"
        data-dismiss="alert"
        aria-label="Close"
        ><svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M1.75373 0.387174C1.37633 0.00977659 0.764449 0.00977659 0.387052 0.387174C0.00965453 0.764571 0.00965453 1.37645 0.387052 1.75385L3.73733 5.10413L0.387052 8.4544C0.00965451 8.8318 0.00965451 9.44368 0.387052 9.82108C0.764449 10.1985 1.37633 10.1985 1.75373 9.82108L5.104 6.4708L8.45428 9.82108C8.83168 10.1985 9.44356 10.1985 9.82096 9.82108C10.1984 9.44368 10.1984 8.8318 9.82096 8.4544L6.47068 5.10413L9.82096 1.75385C10.1984 1.37645 10.1984 0.764571 9.82096 0.387174C9.44356 0.00977658 8.83168 0.00977658 8.45428 0.387174L5.104 3.73745L1.75373 0.387174Z"
            fill="black"
          />
        </svg>
      </a>
      <div class="row no-gutters p-3">
        <div class="col-md-4 m-0">
          <img
            src="{{ 'images/disk-spilling.png' | relative_url }}"
            class="card-img m-0"
            alt="..."
          />
        </div>
        <div class="col-md-8">
          <div class="card-body p-0 pl-4">
            <p
              class="d-inline-block caption-sm rounded py-1 px-3 bg-purple-transparent font-weight-bold text-purple-300 m-0"
            >
              Engineering
            </p>
            <h2 class="card-title font-weight-bold mt-3">
              Disk Spilling in a Vectorized Execution Engine
            </h2>
            <div class="d-flex align-items-center">
              <div>
                <img
                  class="m-0"
                  width="40"
                  src="{{ 'images/alfonso-subioto-marquez.png' | relative_url }}"
                  alt=""
                />
              </div>
              <div class="ml-3 d-flex flex-column justify-content-center">
                <div class="card-text m-0 lh-n">Alfonso Subioto Marquez</div>
                <p class="card-text m-0 lh-n">
                  <small class="text-muted">June 30, 2020</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="text-center">
<a class="btn btn-outline-secondary mt-3" href="https://www.cockroachlabs.com/blog/">Check out the blog</a>
</div>
{% endif %}
