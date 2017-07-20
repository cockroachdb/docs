---
title: CockroachDB Docs
summary: CockroachDB documentation with details on installation, getting started, building an app, deployment, orchestration, and more.
tags: install, build an app, deploy
type: first_page
homepage: true
toc: false
optimizely: true
twitter: true
contribute: false
---

CockroachDB is a cloud-native SQL database for building global, scalable cloud services that survive disasters.

<style>
    #party {
        font-size: 30px;
        padding-right: 10px;
        vertical-align: -20%;
    }
</style>

<div class="row">
    <div class="col-md-4">
        <div class="roach">
            <a href="start-a-local-cluster.html">
                <img src="{{ 'images/SCENE_superhero_profile_craig.png' | relative_url }}" alt="Quickstart CockroachDB"/>
                <h3>Start a Cluster</h3>
                <p>Scale from one to many nodes in seconds.</p>
            </a>
        </div>
    </div>
    <div class="col-md-4">
        <div class="roach">
            <a href="build-an-app-with-cockroachdb.html">
                <img src="{{ 'images/builder_craig.png' | relative_url }}" alt="Build an App"/>
                <h3>Build an App</h3>
                <p>Use a compatible PostgreSQL driver or ORM.</p>
            </a>
        </div>
    </div>
    <div class="col-md-4">
        <div class="roach">
            <a href="demo-data-replication.html">
                <img src="{{ 'images/scientist_catrina.png' | relative_url }}" alt="Examine Core Benefits"/>
                <h3>Explore Benefits</h3>
                <p>See replication, rebalancing, and fault-tolerance in real-time.</p>
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-4">
        <div class="roach">
            <a href="cloud-deployment.html">
                <img src="{{ 'images/craig_crossfit.png' | relative_url }}" alt="Deploy CockroachDB in the Cloud"/>
                <h3>Deploy</h3>
                <p>Cloud-agnostic, with no vendor lock-in.</p>
            </a>
        </div>
    </div>
    <div class="col-md-4">
        <div class="roach">
            <a href="orchestration.html">
                <img src="{{ 'images/sleeping_craig.png' | relative_url }}" alt="Orchestrate CockroachDB"/>
                <h3>Orchestrate</h3>
                <p>Reduce operator overhead to almost nothing.</p>
            </a>
        </div>
    </div>
    <div class="col-md-4">
        <div class="roach">
            <a href="monitor-cockroachdb-with-prometheus.html">
                <img src="{{ 'images/announcement_catrina.png' | relative_url }}" alt="Monitor with Third-Party Tools"/>
                <h3>Monitor</h3>
                <p>Feed our time series metrics into third-party tools.</p>
            </a>
        </div>
    </div>
</div>

## Recent Blog Posts

{% for post in site.data.blog_posts limit:5 %}
<div class="row">
    <div class="col-xs-12">
        <a href="{{ post.link }}">
        <div class="blog-post {% if forloop.last %}last-entry{% endif %}">
            <div class="blog-title">{{ post.title }}</div>
            <div class="blog-meta">
                Written by <span class="meta-emphasis">{{ post.creator }}</span>
                on <span class="meta-emphasis">{{ post.pub_date | date:'%b %-d, %Y' }}</span>
            </div>
        </div>
        </a>
    </div>
</div>
{% endfor %}
<div class="row">
    <div class="col-xs-12">
        <div class="view-blog"><a href="https://www.cockroachlabs.com/blog">View All Posts</a></div>
    </div>
</div>
