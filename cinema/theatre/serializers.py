from rest_framework import serializers
from .models import User, Movie, Booking

from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'address', 'phone_number', 'photo', 'credit_card_number', 'credit_card_expiry', 'credit_card_cvv']
        extra_kwargs = {
            'password': {'write_only': True},  # To ensure password is write-only
            'id': {'read_only': True},  # To ensure id is read-only
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
