---
title: CREATE DATABASE
toc: true
---

## Description

The `CREATE DATABASE` statement creates a new CockroachDB database.  

## Synopsis

{% include sql/diagrams/create_database.html %}

## Privileges

Only the `root` user can create a database.

## Parameters

| Parameter | Description |
|-----------|-------------|
| `name` | The name of the database to create. Names must follow [these rules](data-definition.html#identifiers). |
