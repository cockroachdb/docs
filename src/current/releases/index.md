---
title: CockroachDB Releases
summary: Information about CockroachDB releases with an index of available releases and their release notes and binaries.
toc: true
docs_area: releases
---

{% comment %}Enable debug to print debug messages {% endcomment %}
{% assign DEBUG = false %}

{% comment %} Cache commonly used data {% endcomment %}
{% assign all_production_releases = site.data.releases | where: "release_type", "Production" | sort: "release_date" | reverse %}
{% assign latest_full_production_version = all_production_releases | first %}
{% assign major_versions = all_production_releases | map: "major_version" | uniq | sort | reverse %}
{% assign latest_major_version_with_production = major_versions | first %}

{% comment %} Cache latest hotfix information {% endcomment %}
{% assign latest_hotfix = site.data.releases | where_exp: "latest_hotfix", "latest_hotfix.major_version == site.versions['stable']" | where_exp: "latest_hotfix", "latest_hotfix.withdrawn != true" | sort: "release_date" | reverse | first %}

## Overview

{% include common/license/evolving.md %}

This page explains the types and naming of CockroachDB releases and provides access to the release notes and downloads for all CockroachDB [releases](#downloads).

{% include release_sections/version_info.md %}

### Release types

{% include release_sections/release_types.md %}

### Staged release process

{% include release_sections/staged_release.md %}

### Recent releases

{% include release_sections/recent_releases_table.md %}

### Upcoming releases

{% include release_sections/upcoming_releases_table.md %}

## Downloads

{% include release_sections/downloads.md %}

## Licenses

{% include release_sections/licenses.md %}