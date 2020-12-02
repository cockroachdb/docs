package io.roach.data.jdbc;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Business exception that maps to a given HTTP status code.
 */
@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Negative balance")
public class NegativeBalanceException extends DataIntegrityViolationException {
    public NegativeBalanceException(String message) {
        super(message);
    }
}
