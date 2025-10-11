-- DROP TABLE IF EXISTS account cascade;
-- DROP TABLE IF EXISTS databasechangelog cascade;
-- DROP TABLE IF EXISTS databasechangeloglock cascade;

create table account
(
    id      int            not null primary key default unique_rowid(),
    balance numeric(19, 2) not null,
    name    varchar(128)   not null,
    type    varchar(25)    not null
);

-- insert into account (id,balance,name,type) values
--     (1, 500.00,'Alice','asset'),
--     (2, 500.00,'Bob','expense'),
--     (3, 500.00,'Bobby Tables','asset'),
--     (4, 500.00,'Doris','expense');
