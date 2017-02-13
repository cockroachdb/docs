package com.cockroachlabs;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.criteria.CriteriaQuery;

public class Sample {
    // Create a SessionFactory based on our hibernate.cfg.xml configuration
    // file, which defines how to connect to the database
    private static final SessionFactory sessionFactory =
            new Configuration()
                    .configure("hibernate.cfg.xml")
                    .addAnnotatedClass(Account.class)
                    .buildSessionFactory();

    // Account is our model, which corresponds to the "accounts" database table.
    @Entity
    @Table(name="accounts")
    public static class Account {
        @Id
        @Column(name="id")
        public long id;

        @Column(name="balance")
        public long balance;

        public Account(int id, int balance) {
            this.id = id;
            this.balance = balance;
        }

        public Account() {}
    }

    public static void main(String[] args) throws Exception {
        Session session = sessionFactory.openSession();

        try {
            // Insert two rows into the "accounts" table.
            Account accountOne = new Account(1, 1000);
            Account accountTwo = new Account(2, 250);
            session.beginTransaction();
            session.save(accountOne);
            session.save(accountTwo);
            session.getTransaction().commit();

            // Print out the balances.
            CriteriaQuery<Account> query = session.getCriteriaBuilder().createQuery(Account.class);
            query.select(query.from(Account.class));
            for (Account account : session.createQuery(query).getResultList()) {
                System.out.println(String.format("%d %d", account.id, account.balance));
            }
        } finally {
            session.close();
            sessionFactory.close();
        }
    }
}
