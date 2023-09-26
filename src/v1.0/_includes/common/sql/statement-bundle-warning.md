{{site.data.alerts.callout_danger}}Statement bundles can contain unredacted user data including histograms and placeholders that contain real data samples, statements that have real data which can contain PII information, and database schema that could be sensitive. Be careful when generating and sharing statement bundles.

<br><br>To allow or disallow a role from seeing <a href="{{ link_prefix }}ui-statements-page.html#diagnostics">statements diagnostics bundles</a>, set the <code>VIEWACTIVITYREDACTED</code> <a href="{{ link_prefix }}create-role.html#role-options">role option</a>.

<br><br>In CockroachDB v21.2.x, v22.1.0 to v22.1.16, v22.2.0 to v22.2.6, non-admin SQL users with an authenticated HTTP session could download statement diagnostic bundles given a bundle URL from the DB Console or the <code>EXPLAIN ANALYZE (DEBUG)</code> statement with a valid HTTP session cookie. This has been resolved in v22.1.17 and v22.2.7. For more information, see the <a href="../advisories/a99049.html">Technical Advisory A99049</a>.
{{site.data.alerts.end}}
