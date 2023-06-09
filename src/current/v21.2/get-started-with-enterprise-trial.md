---
title: Enterprise Trial –– Get Started
summary: Check out this page to get started with your CockroachDB Enterprise Trial
toc: true
license: true
docs_area: 
---

Congratulations on starting your CockroachDB Enterprise Trial! With it, you'll not only get access to CockroachDB's core capabilities like [high availability](frequently-asked-questions.html#how-does-cockroachdb-survive-failures) and [`SERIALIZABLE` isolation](frequently-asked-questions.html#how-is-cockroachdb-strongly-consistent), but also our Enterprise-only features like distributed [`BACKUP`](backup.html) &amp; [`RESTORE`](restore.html), [multi-region capabilities](multiregion-overview.html), and [cluster visualization](enable-node-map.html).

## Install CockroachDB

If you haven't already, you'll need to [locally install](install-cockroachdb.html), [remotely deploy](manual-deployment.html), or [orchestrate](kubernetes-overview.html) CockroachDB.

## Enable Enterprise features

{% include {{ page.version.version }}/misc/set-enterprise-license.md %}

You can then use the [`SHOW CLUSTER SETTING`](set-cluster-setting.html) command to verify your license:

{% include_cached copy-clipboard.html %}
~~~ sql
>  SHOW CLUSTER SETTING cluster.organization;
~~~

## Use Enterprise features

Your cluster now has access to all of CockroachDB's Enterprise features for the length of the trial:

{% include {{ page.version.version }}/misc/enterprise-features.md %}

## Getting help

If you or your team need any help during your trial, our engineers are available on [CockroachDB Community Slack](https://cockroachdb.slack.com), [our forum](https://forum.cockroachlabs.com/), or [GitHub](https://github.com/cockroachdb/cockroach).

Also consider checking out [Cockroach University](https://university.cockroachlabs.com/) for free online courses that help you get the most out of CockroachDB.

## See also

- [Licensing FAQs](licensing-faqs.html)
- [`SET CLUSTER SETTING`](set-cluster-setting.html)
- [`SHOW CLUSTER SETTING`](show-cluster-setting.html)
- [Cockroach University](https://university.cockroachlabs.com/)
