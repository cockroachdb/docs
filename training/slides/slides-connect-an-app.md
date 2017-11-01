# Goals

Install Client Drivers - https://www.cockroachlabs.com/docs/stable/install-client-drivers.html
Build an app - https://www.cockroachlabs.com/docs/stable/build-an-app-with-cockroachdb.html

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- Drivers
- ORMs

/----------------------------------------/

## What is it?

- CockroachDB uses PostgreSQL wire protocol

/----------------------------------------/

## Drivers

App Language | Featured Driver 
-------------|-----------------
Go |  [pq](build-a-go-app-with-cockroachdb.html) 
Python |  [psycopg2](build-a-python-app-with-cockroachdb.html) 
Ruby |  [pg](build-a-ruby-app-with-cockroachdb.html) 
Java |  [jdbc](build-a-java-app-with-cockroachdb.html) 
Node.js |  [pg](build-a-nodejs-app-with-cockroachdb.html) 
C++ |  [libpqxx](build-a-c++-app-with-cockroachdb.html) 
Clojure | [java.jdbc](build-a-clojure-app-with-cockroachdb.html)
PHP |  [php-pgsql](build-a-php-app-with-cockroachdb.html) 
Rust |  [postgres](build-a-rust-app-with-cockroachdb.html)

/----------------------------------------/

## ORMs

App Language | Featured ORM
-------------|-------------
Go | [GORM](build-a-go-app-with-cockroachdb-gorm.html)
Python | [SQLAlchemy](build-a-python-app-with-cockroachdb-sqlalchemy.html)
Ruby | [ActiveRecord](build-a-ruby-app-with-cockroachdb-activerecord.html)
Java | [Hibernate](build-a-java-app-with-cockroachdb-hibernate.html)
Node.js | [Sequelize](build-a-nodejs-app-with-cockroachdb-sequelize.html) 

/----------------------------------------/

## Connection String

Connect with connection string:

~~~
postgresql://user@localhost:26257/training?sslmode=disable'
~~~

What do connection strings look like for SSL connections?

/----------------------------------------/

# Lab