from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import check_password
from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    promotions = serializers.BooleanField(default=False)
    class Meta:
        model = User
        fields = ['id', 'first_name','last_name','username', 'email', 'password', 'address', 'phone_number', 'photo', 'credit_card_number', 'credit_card_expiry', 'credit_card_cvv','promotions']
        extra_kwargs = {
            'password': {'write_only': True},  # To ensure password is write-only
            'id': {'read_only': True},  # To ensure id is read-only
            'photo': {'required': False},  # Make the photo field optional
        
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        subject = 'Welcome to CinemaVerse'
        message = 'Thank you for registering with us.'
        email_from = settings.EMAIL_HOST_USER
        recipient_list = [validated_data['email'], ]
        send_mail(subject, message, email_from, recipient_list,fail_silently=False)
        return user

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

class ShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Show
        fields = ['id', 'movie', 'screen', 'start_time', 'end_time', 'price']

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ('id', 'show', 'seatNo', 'is_booked','category')