from django.db import models
import uuid


class Customers(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    name = models.CharField(max_length=250)


class Products(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    name = models.CharField(max_length=250)
    price = models.DecimalField(max_digits=18, decimal_places=2)


class Orders(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False)
    subtotal = models.DecimalField(max_digits=18, decimal_places=2)
    customer = models.ForeignKey(
        Customers, on_delete=models.CASCADE, null=True)
    product = models.ManyToManyField(Products)
