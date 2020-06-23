package io.roach.data.jdbc;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.transaction.annotation.Propagation.MANDATORY;

@Repository
// @Transactional is not needed but here for clarity since we want repos to always be called from a tx context
@Transactional(propagation = MANDATORY)
public class PagedAccountRepositoryImpl implements PagedAccountRepository {
    @Autowired
    private PagedAccountHelper pagedAccountHelper;

    @Override
    public Page<Account> findAll(Pageable pageable) {
        return new PageImpl<>(pagedAccountHelper.findAll(pageable.getPageSize(), pageable.getOffset()),
                pageable,
                pagedAccountHelper.countAll());
    }
}
