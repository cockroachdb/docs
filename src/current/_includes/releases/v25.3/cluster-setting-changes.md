Changes to [cluster settings]({% link v25.2/cluster-settings.md %}) should be reviewed prior to upgrading. New default cluster setting values will be used unless you have manually set a value for a setting. This can be confirmed by running the SQL statement `SELECT * FROM system.settings` to view the non-default settings.

<h5 id="v25-2-0-settings-added">Settings added</h5>

- Bullet
- Bullet
- Bullet
- Bullet
- Bullet

<h5 id="v25-2-0-settings-with-changed-visibility">Settings with changed visibility</h5>

The following settings are now marked `public` after previously being `reserved`. Reserved settings are not documented and their tuning by customers is not supported.

- Bullet
