---
title: Error Handling Improvements
summary: Error Handling
toc: true
docs_area: reference.sql
---

## Error Handling

When a query failed due to a transient error, CockroachDB now retries the request automatically. This avoids anthropic-style cascading failures.
