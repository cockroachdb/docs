-  A query with a `LIMIT` clause scans a table with {% if page.name == "cost-based-optimizer.md" %} improved latency {% else %} [improved latency](cost-based-optimizer.html#locality-optimized-search-in-multi-region-clusters) {% endif %} only if:

    - The table is defined with `LOCALITY REGIONAL BY ROW`.
    - The number of qualified rows (the sum of the `LIMIT` clause and optional `OFFSET` clause values) residing in the local region is less than or equal to `100000`.
