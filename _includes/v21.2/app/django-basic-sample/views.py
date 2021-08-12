from django.http import JsonResponse, HttpResponse
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from django.db import Error, IntegrityError
from django.db.transaction import atomic
from psycopg2 import errorcodes
import json
import sys
import time

from .models import *

# Warning: Do not use retry_on_exception in an inner nested transaction.
def retry_on_exception(num_retries=3, on_failure=HttpResponse(status=500), delay_=0.5, backoff_=1.5):
    def retry(view):
        def wrapper(*args, **kwargs):
            delay = delay_
            for i in range(num_retries):
                try:
                    return view(*args, **kwargs)
                except IntegrityError as ex:
                    if i == num_retries - 1:
                        return on_failure
                    elif getattr(ex.__cause__, 'pgcode', '') == errorcodes.SERIALIZATION_FAILURE:
                        time.sleep(delay)
                        delay *= backoff_
                except Error as ex:
                    return on_failure
        return wrapper
    return retry

class PingView(View):
    def get(self, request, *args, **kwargs):
        return HttpResponse("python/django", status=200)

@method_decorator(csrf_exempt, name='dispatch')
class CustomersView(View):
    def get(self, request, id=None, *args, **kwargs):
        if id is None:
            customers = list(Customers.objects.values())
        else:
            customers = list(Customers.objects.filter(id=id).values())
        return JsonResponse(customers, safe=False)

    @retry_on_exception(3)
    @atomic
    def post(self, request, *args, **kwargs):
        form_data = json.loads(request.body.decode())
        name = form_data['name']
        c = Customers(name=name)
        c.save()
        return HttpResponse(status=200)

    @retry_on_exception(3)
    @atomic
    def delete(self, request, id=None, *args, **kwargs):
        if id is None:
            return HttpResponse(status=404)
        Customers.objects.filter(id=id).delete()
        return HttpResponse(status=200)

    # The PUT method is shadowed by the POST method, so there doesn't seem
    # to be a reason to include it.

@method_decorator(csrf_exempt, name='dispatch')
class ProductView(View):
    def get(self, request, id=None, *args, **kwargs):
        if id is None:
            products = list(Products.objects.values())
        else:
            products = list(Products.objects.filter(id=id).values())
        return JsonResponse(products, safe=False)

    @retry_on_exception(3)
    @atomic
    def post(self, request, *args, **kwargs):
        form_data = json.loads(request.body.decode())
        name, price = form_data['name'], form_data['price']
        p = Products(name=name, price=price)
        p.save()
        return HttpResponse(status=200)

    # The REST API outlined in the github does not say that /product/ needs
    # a PUT and DELETE method

@method_decorator(csrf_exempt, name='dispatch')
class OrdersView(View):
    def get(self, request, id=None, *args, **kwargs):
        if id is None:
            orders = list(Orders.objects.values())
        else:
            orders = list(Orders.objects.filter(id=id).values())
        return JsonResponse(orders, safe=False)

    @retry_on_exception(3)
    @atomic
    def post(self, request, *args, **kwargs):
        form_data = json.loads(request.body.decode())
        c = Customers.objects.get(id=form_data['customer']['id'])
        o = Orders(subtotal=form_data['subtotal'], customer=c)
        o.save()
        for p in form_data['products']:
            p = Products.objects.get(id=p['id'])
            o.product.add(p)
        o.save()
        return HttpResponse(status=200)
