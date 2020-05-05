package io.roach.data.jdbc;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Pagination is not available in spring-data-jdbc (yet) so we create a separate
 * repository to provide basic limit+offset pagination queries for accounts.
 */
public interface PagedAccountRepository {
    Page<Account> findAll(Pageable pageable);
}
