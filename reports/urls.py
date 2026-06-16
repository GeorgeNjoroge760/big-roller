from django.urls import path
from . import views

app_name = 'reports'
urlpatterns = [
    path('', views.report_list, name='report_list'),
    path('generate/', views.generate_daily_report, name='generate_daily'),
    path('<int:report_id>/', views.report_detail, name='report_detail'),
    path('analytics/', views.analytics_view, name='analytics'),
    path('analytics/data/', views.analytics_data, name='analytics_data'),
]
