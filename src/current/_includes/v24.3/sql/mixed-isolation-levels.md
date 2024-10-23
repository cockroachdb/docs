{% if page.name == "transactions.md" %}### Mixed isolation levels{% else if page.name == "transaction-layer.md" %}#### Mixed isolation levels{% endif %}

Regardless of the isolation levels of other transactions, transactions behave according to their respective isolation levels: Statements in `SERIALIZABLE` transactions see data that committed before the transaction began, whereas statements in `READ COMMITTED` transactions see data that committed before each **statement** began. Therefore:

- If a `READ COMMITTED` transaction `R` commits before a `SERIALIZABLE` transaction `S`, every statement in `S` will observe all writes from `R`. Otherwise, `S` will not observe any writes from `R`.
- If a `SERIALIZABLE` transaction `S` commits before a `READ COMMITTED` transaction `R`, every **subsequent** statement in `R` will observe all writes from `S`. Otherwise, `R` will not observe any writes from `S`.

However, there is one difference in how `SERIALIZABLE` writes affect non-locking reads: While writes in a `SERIALIZABLE` transaction can block reads in concurrent `SERIALIZABLE` transactions, they will **not** block reads in concurrent `READ COMMITTED` transactions. Writes in a `READ COMMITTED` transaction will never block reads in concurrent transactions, regardless of their isolation levels. Therefore:

- If a `READ COMMITTED` transaction `R` writes but does not commit before a `SERIALIZABLE` transaction `S`, no statement in `S` will observe or be blocked by any uncommitted writes from `R`.
- If a `SERIALIZABLE` transaction `S` writes but does not commit before a `READ COMMITTED` transaction `R`, no statement in `R` will observe or be blocked by any uncommitted writes from `S`.
- If a `SERIALIZABLE` transaction `S1` writes but does not commit before a `SERIALIZABLE` transaction `S2`, the first statement in `S2` that would observe an unwritten row from `S1` will be blocked until `S1` commits or aborts.