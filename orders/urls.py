from django.urls import path
from . import views

app_name = 'orders'
urlpatterns = [
    path('', views.order_list, name='order_list'),
    path('place/', views.place_order, name='place_order'),
    path('<int:order_id>/', views.order_detail, name='order_detail'),
    path('<int:order_id>/accept/', views.accept_order, name='accept_order'),
    path('<int:order_id>/process-receipt/', views.process_receipt, name='process_receipt'),
    path('<int:order_id>/cancel/', views.cancel_order, name='cancel_order'),
    path('waiter/', views.waiter_orders, name='waiter_orders'),
    path('counter/', views.counter_orders, name='counter_orders'),
]
