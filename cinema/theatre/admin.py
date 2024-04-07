from django.contrib import admin
from .models import *

admin.site.register(Movie)
# Register your models here.
admin.site.register(User)
admin.site.register(PromoCode)
admin.site.register(Screen)
admin.site.register(Show)
admin.site.register(Seat)

admin.site.site_header = 'CinemaVerse'  # Optional: Change site header text
admin.site.site_title = 'CinemaVerse'  # Optional: Change browser tab title
admin.site.index_title = 'CinemaVerse: Admin View'
