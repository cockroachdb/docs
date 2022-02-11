---
title: API Policy
toc: true
summary:
docs_area: releases
---

Cockroach Labs exposes various application programming interfaces. The vast majority of changes to these interfaces are seamless additions of new functionality. However, some changes are backward-incompatible and may require you to adjust your integration.

This page identifies the interfaces that are officially supported as programmable (in full or in part), what types of changes qualify as backward-incompatible for those interfaces, and how Cockroach Labs helps you deal with such changes.

Any interfaces not mentioned here, or not documented on this site, are not considered programmable and are not covered by this policy.

## SQL

The following types of changes to the CockroachDB SQL interface qualify as backward-incompatible. These changes will be identified as such in the release notes for the specific version of CockroachDB in which they are introduced ([example](v21.2.0#backward-incompatible-changes)), and users will be asked to consider them before upgrading to that version.

- Removal of SQL statements, built-in functions, cluster settings, or session variables
- Change in data type, default value, or behavior of built-in functions, cluster settings, or session variables

The following types of changes to the CockroachDB SQL interface do not qualify as backward-incompatible. This list is not exhaustive.

- Removal or change of any SQL functionality documented or named as "experimental", "beta", or otherwise not fully supported.
- Change in format of SQL output

## Cloud API

## Cluster API

## `cockroach` CLI

## `ccloud` CLI

## Health endpoints

## Prometheus endpoint
