from django.contrib import admin
from django.conf.urls import url

from .views import CustomersView, OrdersView, PingView, ProductView

urlpatterns = [
    url('admin/', admin.site.urls),

    url('ping/', PingView.as_view()),

    # Endpoints for customers URL.
    url('customer/', CustomersView.as_view(), name='customers'),
    url('customer/<int:id>/', CustomersView.as_view(), name='customers'),

    # Endpoints for customers URL.
    url('product/', ProductView.as_view(), name='product'),
    url('product/<int:id>/', ProductView.as_view(), name='product'),

    url('order/', OrdersView.as_view(), name='order'),
]
