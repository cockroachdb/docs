package com.example.cockroachdemo.model;

public class BatchResults {
    private int numberOfBatches;
    private int totalRowsAffected;

    public BatchResults(int numberOfBatches, int totalRowsAffected) {
        this.numberOfBatches = numberOfBatches;
        this.totalRowsAffected = totalRowsAffected;
    }

    public int getNumberOfBatches() {
        return numberOfBatches;
    }

    public int getTotalRowsAffected() {
        return totalRowsAffected;
    }
}