"""cockroach_example URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
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
