---
title: ALTER TABLE
summary: Use the ALTER TABLE statement to change the schema of a table. 
toc: false
---

The `ALTER TABLE` [statement](sql-statements.html) applies a schema change to a table.

{{site.data.alerts.callout_info}}To understand how CockroachDB changes schema elements without requiring table locking or other user-visible downtime, see <a href="https://www.cockroachlabs.com/blog/how-online-schema-changes-are-possible-in-cockroachdb/">Online Schema Changes in CockroachDB</a>.{{site.data.alerts.end}}

<div id="toc"></div>

## Synopsis

{% include sql/diagrams/alter_table.html %}

## Required Privileges

The user must have the `CREATE` [privilege](privileges.html) on the table. 

## Parameters

| Parameter | Description |
|-----------|-------------|
|  |  |
