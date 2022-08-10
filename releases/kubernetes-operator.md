---
title: CockroachDB Kubernetes Operator Releases
summary: Changelog for the Kubernetes Operator for CockroachDB
toc: true
docs_area: releases
---

{% capture latest_operator_version %}{% include_cached latest_operator_version.md %}{% endcapture %}

The CockroachDB [Kubernetes Operator](/docs/{{site.versions["stable"]}}/kubernetes-overview.html) is the recommended way to configure, deploy, and manage {{ site.data.products.core }} clusters on Kubernetes. The Kubernetes Operator is released on a separate schedule and is versioned independently from CockroachDB.

This page announces releases of the Kubernetes Operator and provides links to more information on GitHub. **Version {{ latest_operator_version }} is the latest release**.

In addition to monitoring this page, you can subscribe to be notified about releases to the Kubernetes Operator. Visit [CockroachDB Kubernetes Operator source code repository](https://github.com/cockroachdb/cockroach-operator) and click **Watch**.

{{site.data.alerts.callout_success}}
If you already use the [Helm](https://helm.sh/) package manager to manage your Kubernetes infrastructure, you can manage {{ site.data.products.core }} clusters by using the [CockroachDB Helm chart](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb) instead of using the Kubernetes Operator. The Helm chart does not use the Kubernetes Operator, and there is no automated way to migrate from one method to the other.

To be notified about updates to the Helm chart, visit the [CockroachDB Helm chart source code repository](https://github.com/cockroachdb/helm-charts/tree/master/cockroachdb) and click **Watch**.
{{site.data.alerts.end}}

<!-- Copy the top section below and bump the variable -->

## July 13, 2022

{% assign operator_version = "2.8.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## May 26, 2022

{% assign operator_version = "2.7.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## April 14, 2022

{% assign operator_version = "2.6.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## January 7, 2022

{% assign operator_version = "2.5.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## November 8, 2021

{% assign operator_version = "2.4.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## October 19, 2021

{% assign operator_version = "2.3.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## October 5, 2021

{% assign operator_version = "2.2.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})

## August 27, 2021

{% assign operator_version = "2.1.0" %}
CockroachDB Kubernetes Operator {{ operator_version }} is available.

- [Changelog](https://github.com/cockroachdb/cockroach-operator/blob/master/CHANGELOG.md#v{{ operator_version }})
- [Download](https://github.com/cockroachdb/cockroach-operator/releases/tag/v{{ operator_version }})
