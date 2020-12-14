---
title: CockroachDB Docs
summary: CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.
toc: false
homepage: true
contribute: false
build_for: [cockroachdb, cockroachcloud]
cta: false
---

<div class="home-header mb-xl-5 bg-cover bg-cover__bg-3-1">
  <div class="p-5">
  <h1 class="m-0 text-white">Documentation</h1>
  <p class="mt-0 pb-4 text-white">CockroachDB is the SQL database for building global, scalable cloud services that survive disasters.</p>
    <div class="row d-lg-flex">
      <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
        <div class="card card-link h-100 d-flex text-center">
        <a href="#" class="h-100">
          <div class="card-body p-4 d-flex flex-column justify-content-center align-items-center h-100 card-header-overlap">
            <img class="m-0 mb-4 mt-3" src="{{ 'images/icon-in-browser.svg' | relative_url }}"/>
            <h6 class="m-0 text-black">In-browser<br>tutorials</h6>
            <h4 class="mt-auto mb-0 text-electric-purple font-poppins-sb">Learn more <img class="m-0 ml-2" src="{{ 'images/icon-arrow-right-purple.svg' | relative_url }}"/></h4>
          </div>
          </a>
        </div>
      </div>
      <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
        <div class="card card-link h-100 d-flex text-center">
        <a href="#" class="h-100">
          <div class="card-body p-4 d-flex flex-column justify-content-center align-items-center h-100 card-header-overlap">
          <img class="m-0 mb-4 mt-3" src="{{ 'images/icon-sample-apps.svg' | relative_url }}"/>
            <h6 class="m-0 text-black">Sample <br>Applications</h6>
            <h4 class="mt-auto mb-0  text-electric-purple font-poppins-sb">Learn more <img class="m-0 ml-2" src="{{ 'images/icon-arrow-right-purple.svg' | relative_url }}"/></h4>
          </div>
          </a>
        </div>
        </div>
      <div class="col-lg-4 mb-3 mb-lg-0 pb-5">
        <div class="card card-link h-100 d-flex text-center">
        <a href="#" class="h-100">
          <div class="card-body p-4 d-flex flex-column justify-content-center align-items-center h-100 card-header-overlap">
          <img class="m-0 mb-4 mt-3" src="{{ 'images/icon-deploy-cloud.svg' | relative_url }}"/>
            <h6 class="m-0 text-black">Deploy with <br>CockroachCloud</h6>
            <h4 class="mt-auto mb-0  text-electric-purple font-poppins-sb">Learn more <img class="m-0 ml-2" src="{{ 'images/icon-arrow-right-purple.svg' | relative_url }}"/></h4>
          </div>
          </a>
        </div>
      </div>
    </div>
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

<div class="container">

  <div class="row pt-5 mt-5 pb-5 mb-5">
    <div class="col-lg-8">
    <p class="overline">CockroachCloud</p>
    <h2 class="mt-0">Serverless Deployment</h2>
    <p class="h4">Supporting text goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Drives to capabilities page.</p>
    <a class="btn btn-redirect mt-3" href="#">Start a Cluster <img class="m-0" src="{{ 'images/arrow-left.svg' | relative_url }}"/></a>
    </div>
  </div>

  <div class="row">
    <div class="col-12">
      <p class="overline">CockroachDB</p>
      <h2 class="mt-2">Recommended articles</h2>
    </div>
  </div>

  <div class="row display-flex pb-4 mb-5">
    <div class="col-sm-6 col-lg-3">
      <h3 class="mt-3">Get Started</h3>
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
    <div class="col-sm-6 col-lg-3">
      <h3 class="mt-3">Develop</h3>
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
    <div class="col-sm-6 col-lg-3">
      <h3 class="mt-3">Deploy</h3>
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
    <div class="col-sm-6 col-lg-3">
      <h3 class="mt-3">Migrate</h3>
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


<p class="overline">Releases</p>
  <h2 class="mt-2">What’s new in docs</h2>

<div class="row">
    <div class="col-lg-8">
    <div class="row mb-3">
      <div class="col-lg-2 pr-lg-0 text-gray-500"><div class="border-bottom d-flex h-100 h4">June 25, 2020</div></div>
      <div class="col-lg-8 pl-lg-0">
      <div class="border-bottom">
        <div><p class="font-weight-bold m-0 h5">Enterprise edition changes</p></div>
        <div class="text-gray-600 pb-3 h4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam dignissim et mattis <a href="#">scelerisque donec</a> habitasse ut hac. Eget.</div>
        </div>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-lg-2 pr-lg-0 text-gray-500"><div class="border-bottom d-flex h-100 h4">June 25, 2020</div></div>
      <div class="col-lg-8 pl-lg-0">
        <div class="border-bottom">
        <div><p class="font-weight-bold m-0 h5">Enterprise edition changes</p></div>
        <div class="text-gray-600 pb-3 h4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam dignissim et mattis <a href="#">scelerisque donec</a> habitasse ut hac. Eget.</div>
        </div>
      </div>
    </div>

  </div>
</div>


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
            <h6 class="card-title font-weight-bold mt-3">
              Disk Spilling in a Vectorized Execution Engine
            </h6>
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
<a class="btn btn-outline-primary mt-3" href="https://www.cockroachlabs.com/blog/">Check out the blog</a>
</div>

</div>

{% endif %}
