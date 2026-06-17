from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.login_view, name='api_login'),
    path('auth/me/', views.me_view, name='api_me'),

    # Categories
    path('categories/', views.category_list, name='api_categories'),

    # Products
    path('products/', views.product_list, name='api_products'),
    path('products/<int:pk>/', views.product_detail, name='api_product_detail'),

    # Orders
    path('orders/', views.order_list, name='api_orders'),
    path('orders/place/', views.place_order, name='api_place_order'),
    path('orders/<int:pk>/', views.order_detail, name='api_order_detail'),
    path('orders/<int:pk>/accept/', views.accept_order, name='api_accept_order'),
    path('orders/<int:pk>/cancel/', views.cancel_order, name='api_cancel_order'),
    path('orders/<int:pk>/process/', views.process_order, name='api_process_order'),

    # Notifications
    path('notifications/', views.notification_list, name='api_notifications'),
    path('notifications/<int:pk>/read/', views.mark_notification_read, name='api_notif_read'),
    path('notifications/read-all/', views.mark_all_read, name='api_notif_read_all'),
    path('notifications/unread-count/', views.unread_count, name='api_unread_count'),

    # Dashboard
    path('dashboard/', views.dashboard, name='api_dashboard'),
]
