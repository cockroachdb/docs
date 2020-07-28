package io.roach.data.jpa;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "Negative balance")
public class NegativeBalanceException extends DataIntegrityViolationException {
    public NegativeBalanceException(String message) {
        super(message);
    }
}
