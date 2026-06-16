from django.urls import path
from . import views

app_name = 'dashboards'
urlpatterns = [
    path('', views.home, name='home'),
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('waiter/', views.waiter_dashboard, name='waiter_dashboard'),
    path('counter/', views.counter_dashboard, name='counter_dashboard'),
]
