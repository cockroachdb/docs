package io.roach.data.jdbc;

import java.lang.reflect.UndeclaredThrowableException;
import java.util.concurrent.atomic.AtomicLong;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

/**
 * Aspect with an around advice that intercepts and retries transient concurrency exceptions.
 * Methods matching the pointcut expression (annotated with @Transactional) are retried a number
 * of times with exponential backoff.
 * <p>
 * This advice needs to runs in a non-transactional context, which is before the underlying
 * transaction advisor (@Order ensures that).
 */
@Component
@Aspect
// Before TX advisor
@Order(Ordered.LOWEST_PRECEDENCE - 2)
public class RetryableTransactionAspect {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    @Pointcut("execution(* io.roach..*(..)) && @annotation(transactional)")
    public void anyTransactionBoundaryOperation(Transactional transactional) {
    }

    @Around(value = "anyTransactionBoundaryOperation(transactional)",
            argNames = "pjp,transactional")
    public Object retryableOperation(ProceedingJoinPoint pjp, Transactional transactional)
            throws Throwable {
        final int totalRetries = 30;
        int numAttempts = 0;
        AtomicLong backoffMillis = new AtomicLong(150);

        Assert.isTrue(!TransactionSynchronizationManager.isActualTransactionActive(), "TX active");

        do {
            try {
                numAttempts++;
                return pjp.proceed();
            } catch (TransientDataAccessException | TransactionSystemException ex) {
                handleTransientException(ex, numAttempts, totalRetries, pjp, backoffMillis);
            } catch (UndeclaredThrowableException ex) {
                Throwable t = ex.getUndeclaredThrowable();
                if (t instanceof TransientDataAccessException) {
                    handleTransientException(t, numAttempts, totalRetries, pjp, backoffMillis);
                } else {
                    throw ex;
                }
            }
        } while (numAttempts < totalRetries);

        throw new ConcurrencyFailureException("Too many transient errors (" + numAttempts + ") for method ["
                + pjp.getSignature().toLongString() + "]. Giving up!");
    }

    private void handleTransientException(Throwable ex, int numAttempts, int totalAttempts,
                                          ProceedingJoinPoint pjp, AtomicLong backoffMillis) {
        if (logger.isWarnEnabled()) {
            logger.warn("Transient data access exception (" + numAttempts + " of max " + totalAttempts + ") "
                    + "detected (retry in " + backoffMillis + " ms) "
                    + "in method '" + pjp.getSignature().getDeclaringTypeName() + "." + pjp.getSignature().getName()
                    + "': " + ex.getMessage());
        }
        if (backoffMillis.get() >= 0) {
            try {
                Thread.sleep(backoffMillis.get());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            backoffMillis.set(Math.min((long) (backoffMillis.get() * 1.5), 1500));
        }
    }
}
