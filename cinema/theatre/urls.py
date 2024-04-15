from django.urls import path
from .views import *

urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('',movies,name="movies"),
    path('movies/<int:movie_id>/', movie_details, name='movie-details'),
    path('login/', user_login, name='user_login'),
    path('logout/', user_logout, name='user_logout'),
    path('edit_profile/', EditProfileView.as_view(), name='edit_profile'),
    path('change_password/', ChangePasswordAPIView.as_view(), name='change_password'),
    path('csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('forgot_password/', ForgotPasswordAPIView.as_view(),name='forgot_password'),
    path('reset_password/', ResetPasswordAPIView.as_view(),name='reset_password'),
    path('seat-booking/<int:show_id>/', seat_booking, name='seat-booking'),
    path('shows/<int:show_id>/capacity/', get_capacity, name='get_capacity'),
    path('shows/<int:show_id>/', get_price, name='show-seat-price'),
    path('categories/',get_categories,name='categories'),
    path('validate-promo-code/',validate_promo_code,name='promocode'),
    path('book/',create_booking,name='book'),
    path('order_history/',OrderHistoryView.as_view(),name='order_history'),
    path('cancelBooking/<int:booking_id>/', cancel_booking,name='cancel_booking'),
    path('bookingcred/<int:booking_id>/',booking_cred,name='bookingcred'),
]
