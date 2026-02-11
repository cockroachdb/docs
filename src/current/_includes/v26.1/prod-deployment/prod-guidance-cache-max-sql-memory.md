{% capture formula %}{% include_cached copy-clipboard.html %}<div class="highlight"><pre><code class="language-none" data-lang="none">(2 * --max-sql-memory) + --cache &lt;= 80% of system RAM
</code></pre></div>
{% endcapture %}
The default value for `--cache` is 128 MiB. For production deployments, set `--cache` to `25%` or higher. To determine appropriate settings for `--cache` and `--max-sql-memory`, use the following formula: {{ formula }}

To help guard against [OOM events]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash), CockroachDB sets a soft memory limit using mechanisms in Go. Depending on your hardware and workload, you may not need to manually tune `--max-sql-memory`.

Test the configuration with a reasonable workload before deploying it to production.

{{site.data.alerts.callout_info}}
On startup, if CockroachDB detects that `--max-sql-memory` or `--cache` are set too aggressively, a warning is logged.
{{site.data.alerts.end}}
