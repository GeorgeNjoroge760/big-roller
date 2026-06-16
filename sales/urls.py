from django.urls import path
from . import views

app_name = 'sales'
urlpatterns = [
    path('', views.sale_list, name='sale_list'),
    path('analytics/api/', views.sales_analytics_api, name='sales_analytics_api'),
]
