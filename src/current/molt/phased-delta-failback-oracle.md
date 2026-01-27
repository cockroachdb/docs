---
title: Phased Delta Migration with Failback Replication from Oracle
summary: Learn what a Phased Delta Migration with Failback Replication is, how it relates to the migration considerations, and how to perform it using MOLT tools.
toc: true
docs_area: migrate
---

<script>
    const url = new URL(window.location.href);
    if (!url.searchParams.has('filters')) {
        var searchParams = new URLSearchParams(window.location.search);
        searchParams.set("filters", "oracle");
        window.location.search = searchParams.toString();
    }
</script>

{% include molt/phased-delta-failback-all-sources.md %}