from django.contrib import admin
from .models import *
from django.contrib.auth.admin import UserAdmin

admin.site.register(Movie)
admin.site.register(PromoCode)
admin.site.register(Screen)
admin.site.register(Show)
admin.site.register(Seat)
admin.site.register(Booking)


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('date_joined', 'last_login')

    # Override the fieldsets to exclude credit card details
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'photo', 'address', 'phone_number', 'promotions')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.register(User, CustomUserAdmin)





admin.site.site_header = 'CinemaVerse'  # Optional: Change site header text
admin.site.site_title = 'CinemaVerse'  # Optional: Change browser tab title
admin.site.index_title = 'CinemaVerse: Admin View'
