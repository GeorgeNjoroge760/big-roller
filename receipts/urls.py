from django.urls import path
from . import views

app_name = 'receipts'
urlpatterns = [
    path('', views.receipt_list, name='receipt_list'),
    path('<int:receipt_id>/', views.receipt_detail, name='receipt_detail'),
    path('generate/<int:order_id>/', views.generate_receipt, name='generate_receipt'),
]
