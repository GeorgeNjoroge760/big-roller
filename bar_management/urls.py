from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('panel/', include('dashboards.urls')),
    path('', RedirectView.as_view(url='/panel/', permanent=False)),
    path('users/', include('users.urls')),
    path('products/', include('products.urls')),
    path('orders/', include('orders.urls')),
    path('inventory/', include('inventory.urls')),
    path('receipts/', include('receipts.urls')),
    path('payments/', include('payments.urls')),
    path('sales/', include('sales.urls')),
    path('notifications/', include('notifications.urls')),
    path('reports/', include('reports.urls')),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
