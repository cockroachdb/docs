Because the data in `promo_codes` is not updated frequently (a.k.a., "read-mostly"), and needs to be available from any region, the right table locality is [`GLOBAL`]({% link {{ page.version.version }}/table-localities.md %}#global-tables).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE promo_codes SET locality GLOBAL;
~~~

Next, alter the `user_promo_codes` table to have a foreign key into the global `promo_codes` table. This will enable fast reads of the `promo_codes.code` column from any region in the cluster.

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE user_promo_codes
  ADD CONSTRAINT user_promo_codes_code_fk
    FOREIGN KEY (code)
    REFERENCES promo_codes (code)
    ON UPDATE CASCADE;
~~~
