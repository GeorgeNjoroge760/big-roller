from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'phone', 'employee_id']
    list_filter = ['role']
    search_fields = ['user__username', 'user__email', 'phone', 'employee_id']
