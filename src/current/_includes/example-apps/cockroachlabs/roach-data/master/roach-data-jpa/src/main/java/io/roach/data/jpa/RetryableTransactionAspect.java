package io.roach.data.jpa;

import java.lang.reflect.UndeclaredThrowableException;
import java.sql.SQLException;
import java.time.Duration;
import java.time.Instant;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.TransientDataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.transaction.annotation.Transactional;

@Component
@Aspect
@Order(Ordered.LOWEST_PRECEDENCE - 1)
public class RetryableTransactionAspect {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private final int retryAttempts = 30;

    private final int maxBackoff = 15000;

    @Pointcut("execution(* io.roach..*(..)) && @annotation(transactional)")
    public void anyTransactionBoundaryOperation(Transactional transactional) {
    }

    @Around(value = "anyTransactionBoundaryOperation(transactional)",
            argNames = "pjp,transactional")
    public Object doInTransaction(ProceedingJoinPoint pjp, Transactional transactional)
            throws Throwable {
        int numCalls = 0;

        final Instant callTime = Instant.now();

        do {
            try {
                numCalls++;
                Object rv = pjp.proceed();
                if (numCalls > 1) {
                    logger.debug(
                            "Transient error recovered after " + numCalls + " of " + retryAttempts + " retries ("
                                    + Duration.between(callTime, Instant.now()).toString() + ")");
                }
                return rv;
            } catch (TransientDataAccessException | TransactionSystemException ex) { // TX abort on commit's
                Throwable cause = NestedExceptionUtils.getMostSpecificCause(ex);
                if (cause instanceof SQLException) {
                    SQLException sqlException = (SQLException) cause;
                    if ("40001".equals(sqlException.getSQLState())) { // Transient error code
                        handleTransientException(sqlException, numCalls, pjp.getSignature().toShortString());
                        continue;
                    }
                }

                throw ex;
            } catch (UndeclaredThrowableException ex) {
                Throwable t = ex.getUndeclaredThrowable();
                while (t instanceof UndeclaredThrowableException) {
                    t = ((UndeclaredThrowableException) t).getUndeclaredThrowable();
                }

                Throwable cause = NestedExceptionUtils.getMostSpecificCause(ex);
                if (cause instanceof SQLException) {
                    SQLException sqlException = (SQLException) cause;
                    if ("40001".equals(sqlException.getSQLState())) { // Transient error code
                        handleTransientException(sqlException, numCalls, pjp.getSignature().toShortString());
                        continue;
                    }
                }

                throw ex;
            }
        } while (numCalls < retryAttempts);

        throw new ConcurrencyFailureException("Too many transient errors (" + numCalls + ") for method ["
                + pjp.getSignature().toShortString() + "]. Giving up!");
    }

    private void handleTransientException(SQLException ex, int numCalls, String method) {
        try {
            long backoffMillis = Math.min((long) (Math.pow(2, numCalls) + Math.random() * 1000), maxBackoff);
            if (numCalls <= 1 && logger.isWarnEnabled()) {
                logger.warn("Transient error detected (backoff {}ms) in call {} to '{}': {}",
                        backoffMillis, numCalls, method, ex.getMessage());
            }
            Thread.sleep(backoffMillis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
