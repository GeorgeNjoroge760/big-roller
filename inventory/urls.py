from django.urls import path
from . import views

app_name = 'inventory'
urlpatterns = [
    path('logs/', views.inventory_log, name='logs'),
    path('low-stock/', views.low_stock_alerts, name='low_stock'),
    path('stock-alerts-api/', views.stock_alerts_api, name='stock_alerts_api'),
]
