from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('users/',user_list,name='user_list'),
    path('',movies,name="movies"),
    path('movies/<int:movie_id>/', movie_details, name='movie-details'),
]
