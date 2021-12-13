from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Register your models here.
class UserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'is_staff', 'is_superuser')
    fieldsets = (
    (None, {
        'fields': ('username', 'password')
    }),
    ('Personal info', {
        'fields': ('first_name', 'last_name', 'email')
    }),
    ('Permissions', {
        'fields': (
            'is_active', 'is_staff', 'is_superuser',
            'groups', 'user_permissions'
            )
    }),
    ('Important dates', {
        'fields': ('last_login', 'date_joined')
    }),
    ('Additional info', {
        'fields': ('number_of_wins', 'last_win', 'best_moves', 'best_time', 'following')
    })
)
    add_fieldsets = (
        (None, {
            'fields': ('username', 'password1', 'password2')
        }),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'email')
        }),
        ('Permissions', {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
                )
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined')
        }),
        ('Additional info', {
            'fields': ('number_of_wins', 'last_win', 'best_moves', 'best_time', 'following')
        })
    )


admin.site.register(User, UserAdmin)