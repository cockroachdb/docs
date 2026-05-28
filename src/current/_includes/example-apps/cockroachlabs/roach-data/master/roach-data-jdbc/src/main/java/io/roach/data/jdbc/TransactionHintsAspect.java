package io.roach.data.jdbc;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

/**
 * Aspect with an around advice that intercepts and sets transaction attributes.
 * <p>
 * This advice needs to runs in a transactional context, which is after the underlying
 * transaction advisor.
 */
@Component
@Aspect
// After TX advisor
@Order(Ordered.LOWEST_PRECEDENCE)
public class TransactionHintsAspect {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String applicationName = "roach-data";

    @Pointcut("execution(* io.roach..*(..)) && @annotation(transactional)")
    public void anyTransactionBoundaryOperation(Transactional transactional) {
    }

    @Around(value = "anyTransactionBoundaryOperation(transactional)",
            argNames = "pjp,transactional")
    public Object setTransactionAttributes(ProceedingJoinPoint pjp, Transactional transactional)
            throws Throwable {
        Assert.isTrue(TransactionSynchronizationManager.isActualTransactionActive(), "TX not active");

        // https://www.cockroachlabs.com/docs/v19.2/set-vars.html
        jdbcTemplate.update("SET application_name=?", applicationName);

        if (transactional.timeout() != TransactionDefinition.TIMEOUT_DEFAULT) {
            logger.info("Setting statement time {} for {}", transactional.timeout(),
                    pjp.getSignature().toShortString());
            jdbcTemplate.update("SET statement_timeout=?", transactional.timeout() * 1000);
        }

        if (transactional.readOnly()) {
            logger.info("Setting transaction read only for {}", pjp.getSignature().toShortString());
            jdbcTemplate.execute("SET transaction_read_only=true");
        }

        return pjp.proceed();
    }
}
