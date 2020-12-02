package io.roach.data.jdbc;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.IanaLinkRelations;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;
import static org.springframework.transaction.annotation.Propagation.REQUIRES_NEW;

/**
 * Main remoting and transaction boundary in the form of a REST controller. The discipline
 * when following the entity-control-boundary (ECB) pattern is that only service boundaries
 * are allowed to start and end transactions. A service boundary can be a controller, business
 * service facade or service activator (JMS/Kafka listener).
 * <p>
 * This is enforced by the REQUIRES_NEW propagation attribute of @Transactional annotated
 * controller methods. Between the web container's HTTP listener and the transaction proxy,
 * there's yet another transparent proxy in the form of a retry loop advice with exponential
 * backoff. It takes care of retrying transactions that are aborted by transient SQL errors,
 * rather than having these propagate all the way over the wire to the client / user agent.
 *
 * @see RetryableTransactionAspect
 */
@RestController
public class AccountController {
    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PagedResourcesAssembler<Account> pagedResourcesAssembler;

    /**
     * Provides the service index resource representation which is only links
     * for clients to follow.
     */
    @GetMapping
    public ResponseEntity<RepresentationModel> index() {
        RepresentationModel index = new RepresentationModel();

        // Type-safe way to generate URLs bound to controller methods
        index.add(linkTo(methodOn(AccountController.class)
                .listAccounts(PageRequest.of(0, 5)))
                .withRel("accounts")); // Lets skip curies and affordances for now

        // This rel essentially informs the client that a POST to its href with
        // form parameters will transfer funds between referenced accounts.
        // (its only a demo)
        index.add(linkTo(AccountController.class)
                .slash("transfer{?fromId,toId,amount}")
                .withRel("transfer"));

        // Spring boot actuators for observability / monitoring
        index.add(new Link(
                ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .pathSegment("actuator")
                        .buildAndExpand()
                        .toUriString()
        ).withRel("actuator"));

        return new ResponseEntity<>(index, HttpStatus.OK);
    }

    /**
     * Provides a paged representation of accounts (sort order omitted).
     */
    @GetMapping("/account")
    @Transactional(propagation = REQUIRES_NEW)
    public HttpEntity<PagedModel<AccountModel>> listAccounts(
            @PageableDefault(size = 5, direction = Sort.Direction.ASC) Pageable page) {
        return ResponseEntity
                .ok(pagedResourcesAssembler.toModel(accountRepository.findAll(page), accountModelAssembler()));
    }

    /**
     * Provides a point lookup of a given account.
     */
    @GetMapping(value = "/account/{id}")
    @Transactional(propagation = REQUIRES_NEW, readOnly = true) // Notice its marked read-only
    public HttpEntity<AccountModel> getAccount(@PathVariable("id") Long accountId) {
        return new ResponseEntity<>(accountModelAssembler().toModel(
                accountRepository.findById(accountId)
                        .orElseThrow(() -> new DataRetrievalFailureException("No such account: " + accountId))),
                HttpStatus.OK);
    }

    /**
     * Main funds transfer method.
     */
    @PostMapping(value = "/transfer")
    @Transactional(propagation = REQUIRES_NEW)
    public HttpEntity<BigDecimal> transfer(
            @RequestParam("fromId") Long fromId,
            @RequestParam("toId") Long toId,
            @RequestParam("amount") BigDecimal amount
    ) {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Negative amount");
        }
        if (fromId.equals(toId)) {
            throw new IllegalArgumentException("From and to accounts must be different");
        }

        BigDecimal fromBalance = accountRepository.getBalance(fromId).add(amount.negate());
        // Application level invariant check.
        // Could be enhanced or replaced with a CHECK constraint like:
        // ALTER TABLE account ADD CONSTRAINT check_account_positive_balance CHECK (balance >= 0)
        if (fromBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new NegativeBalanceException("Insufficient funds " + amount + " for account " + fromId);
        }

        accountRepository.updateBalance(fromId, amount.negate());
        accountRepository.updateBalance(toId, amount);

        return ResponseEntity.ok().build();
    }

    private RepresentationModelAssembler<Account, AccountModel> accountModelAssembler() {
        return (entity) -> {
            AccountModel model = new AccountModel();
            model.setName(entity.getName());
            model.setType(entity.getType());
            model.setBalance(entity.getBalance());
            model.add(linkTo(methodOn(AccountController.class)
                    .getAccount(entity.getId())
            ).withRel(IanaLinkRelations.SELF));
            return model;
        };
    }
}
