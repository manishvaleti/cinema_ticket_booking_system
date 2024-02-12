from django.urls import path
from .views import *

urlpatterns = [
    path('api/register/', register_user, name='register_user'),
    path('api/users/',user_list,name='user_list')
]
