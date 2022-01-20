Because the data in `promo_codes` is not updated frequently (a.k.a., "read-mostly"), and needs to be available from any region, the right table locality is [`GLOBAL`](multiregion-overview.html#global-tables).

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE promo_codes SET locality GLOBAL;
~~~

Next, alter the `user_promo_codes` table to have a foreign key into the `promo_codes` table. This step is necessary to modify the MovR schema design to take full advantage of the multi-region features in v21.1+.

{% include copy-clipboard.html %}
~~~ sql
ALTER TABLE user_promo_codes
  ADD CONSTRAINT user_promo_codes_code_fk
    FOREIGN KEY (code)
    REFERENCES promo_codes (code)
    ON UPDATE CASCADE;
~~~
