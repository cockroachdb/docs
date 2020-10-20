from django.contrib import admin
from django.urls import path

from .views import CustomersView, OrdersView, PingView, ProductView

urlpatterns = [
    path('admin/', admin.site.urls),

    path('ping/', PingView.as_view()),

    # Endpoints for customers URL.
    path('customer/', CustomersView.as_view(), name='customers'),
    path('customer/<int:id>/', CustomersView.as_view(), name='customers'),

    # Endpoints for customers URL.
    path('product/', ProductView.as_view(), name='product'),
    path('product/<int:id>/', ProductView.as_view(), name='product'),

    path('order/', OrdersView.as_view(), name='order'),
]
