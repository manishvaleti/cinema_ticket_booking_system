from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import *
from .models import *
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from django.middleware.csrf import get_token
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
import jwt
from django.utils.crypto import get_random_string
from django.http import JsonResponse 
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from django.template.loader import render_to_string
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
import random
import string

fernet_key = bytes(settings.FERNET_KEY)

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    print(request.data)
    if serializer.is_valid():
        print("Save")
        user = serializer.save()
        user.set_password(serializer.validated_data['password'])  # Use validated_data
        user.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(['GET'])
def user_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

@api_view(['GET'])
def movies(request):
    if request.method == 'GET':
        # Get query parameters
        genre = request.query_params.get('genre', None)
        search = request.query_params.get('search', None)

        # Start with all movies
        queryset = Movie.objects.all()

        # Filter by genre if the genre parameter is provided and not 'all'
        if genre and genre.lower() != 'all':
            queryset = queryset.filter(genre__icontains=genre)

        # Filter by search term if the search parameter is provided
        if search:
            queryset = queryset.filter(title__icontains=search)

        # Apply the serializer and return the response
        serializer = MovieSerializer(queryset, many=True)
        return Response(serializer.data)
    


@api_view(['GET'])
def get_csrf_token(request):
    csrf_token = get_token(request)
    return Response({'csrfToken': csrf_token})

@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    user1 = User.objects.filter(username=username).first()  # Get the user object if exists
    
    if user1 is None:
        # User with the given username doesn't exist
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user1.is_active:
        # User account is inactive
        return Response({'detail': 'Your account is inactive. Please contact Cinemaverse at cinemaaversee@gmail.com.'}, status=status.HTTP_401_UNAUTHORIZED)
    if user is not None:  # Check if the user account is active
        login(request, user)
        # Generate or fetch the token associated with the user
        refresh = RefreshToken.for_user(user)
        token = str(refresh.access_token)
        # Include token along with other user data in the response
        response_data = {
            'token': token,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
            # Include other additional fields here as needed
        }
        return Response(response_data, status=status.HTTP_200_OK)
       
    else:
        # Authentication failed due to invalid credentials
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
def user_logout(request):
    token = request.headers.get('Authorization', '').split(' ')[1]
    
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        
        # Check if the user exists or is authenticated
        if user_id:
            print("User ID:", payload)  # Print user ID for debugging purposes
            logout(request)
            return Response({'message': 'User logged out successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # No content needs to be returned, just indicate success
    return Response(status=status.HTTP_204_NO_CONTENT)
# User = get_user_model()


class EditProfileView(APIView):
    # Define AES decryption method
    def decrypt_aes(self, iv, ct_bytes, key):
        cipher = AES.new(key, AES.MODE_CBC, iv=iv)
        pt = unpad(cipher.decrypt(ct_bytes), AES.block_size)
        return pt.decode()

    def get(self, request, *args, **kwargs):
        # Get the JWT token from the request headers
        token = request.headers.get('Authorization', '').split(' ')[1]

        try:
            # Decode and verify the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            
            # Get user details based on the decoded user_id
            user = User.objects.get(id=user_id)
            
            # Initialize decrypted values
            ccn = ''
            cvv = ''
            
            # Check if credit card number and CVV are not empty
            if user.credit_card_number:
                # Decode and decrypt credit card number
                ccn_data = base64.b64decode(user.credit_card_number)
                iv_ccn = ccn_data[:16]  # Extract IV
                encrypted_ccn = ccn_data[16:]  # Extract encrypted data
                ccn = self.decrypt_aes(iv_ccn, encrypted_ccn, user.key)

            if user.credit_card_cvv:
                # Decode and decrypt CVV
                cvv_data = base64.b64decode(user.credit_card_cvv)
                iv_cvv = cvv_data[:16]  # Extract IV
                encrypted_cvv = cvv_data[16:]  # Extract encrypted data
                cvv = self.decrypt_aes(iv_cvv, encrypted_cvv, user.key)

            # Serialize user details with decrypted card details
            serializer = UserSerializer(user)
            data = serializer.data
            data['credit_card_number'] = ccn
            data['credit_card_cvv'] = cvv
            return Response(data)

        except jwt.ExpiredSignatureError:
            # Handle token expiration error
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        
        except jwt.InvalidTokenError:
            # Handle invalid token error
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            # Handle user not found error
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, *args, **kwargs):
        token = request.headers.get('Authorization', '').split(' ')[1]

        try:
            # Decode and verify the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']

            # Retrieve the user instance
            user = User.objects.get(id=user_id)

            # Update user details using serializer
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                instance = serializer.save()
                # You can include any additional logic here
                # For example, sending notifications
                self.send_update_notification(instance)
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    
    def send_update_notification(self, instance):
        subject = 'CinemaVerse: Profile Update Notification'
        message = 'Your profile details have been successfully updated.'
        recipient_list = [instance.email]  # Assuming email is a field in your User model
        send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)


class ChangePasswordAPIView(APIView):
    def post(self, request, *args, **kwargs):
        token = request.headers.get('Authorization', '').split(' ')[1]
        try:
            # Decode and verify the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']

            # Retrieve the user instance
            user = User.objects.get(id=user_id)

            # Update user details using serializer
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')

        # Check if the old password matches
            if not check_password(old_password, user.password):
                return Response({'error': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        # Change the password
            user.set_password(new_password)
            user.save()
            self.send_update_notification(user)
            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def send_update_notification(self, instance):
        subject = 'CinemaVerse: Password Update Notification'
        message = 'Your profile password has been successfully updated.'
        recipient_list = [instance.email]  # Assuming email is a field in your User model
        send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)    

class ForgotPasswordAPIView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')  # Get email from request data

        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            temp_password = get_random_string(length=10)  # Generate temporary password
            user.set_password(temp_password)
            user.save()

            send_mail(
                'Temporary Password',
                f'Your temporary password is: {temp_password}',
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )

            return Response({'message': 'Temporary password sent to your email.'})
        except User.DoesNotExist:
            return Response({'error': 'No user found with this email.'}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordAPIView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        temp_password = request.data.get('temp_password')
        new_password = request.data.get('new_password')

        if not (username and temp_password and new_password):
            return Response({'error': 'Email, temporary password, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)

            # Verify the temporary password
            if user.check_password(temp_password):
                # Set the new password
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Password reset successfully.'})
            else:
                return Response({'error': 'Invalid temporary password.'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'error': 'No user found with this email.'}, status=status.HTTP_400_BAD_REQUEST)
        

@api_view(['GET'])
def movie_details(request, movie_id):
    try:
        movie = Movie.objects.get(pk=movie_id)
        movie_serializer = MovieSerializer(movie)
        
        # Retrieve related shows for the movie
        shows = Show.objects.filter(movie=movie)
        show_serializer = ShowSerializer(shows, many=True)
        data = {
            "movie": movie_serializer.data,
            "shows": show_serializer.data
        }
        
        return Response(data)
    except Movie.DoesNotExist:
        return Response({"error": "Movie not found"}, status=404)
    
@api_view(['GET', 'PUT'])
def seat_booking(request, show_id):
    """
    GET: Retrieve all the booked seats for a given show.
    PUT: Book selected seats for the given show.
    """
    if request.method == 'GET':
        # Retrieve all booked seats for the show
        booked_seats = Seat.objects.filter(show=show_id, is_booked=True)
        serializer = SeatSerializer(booked_seats, many=True)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # Book selected seats
        data = request.data
        seat_details = data.get('seats')

        if not seat_details:
            return Response(
                {"error": "No seats to book provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for seat_detail in seat_details:
            seat_no = seat_detail.get('seat')
            category = seat_detail.get('category')

            # Create a new Seat object for each booked seat
            try:
                seat = Seat.objects.create(show_id=show_id, seatNo=seat_no, is_booked=True, category=category)
            except Exception as e:
                return Response(
                    {"error": f"Failed to book seat {seat_no}: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Return a success response
        return Response(
            {"message": "Seats successfully booked."},
            status=status.HTTP_201_CREATED
        )
    
@api_view(['GET'])
def get_capacity(request, show_id):
    try:
        show = Show.objects.get(pk=show_id)
        screen = show.screen
        return Response({'capacity': screen.capacity}, status=status.HTTP_200_OK)
    except Show.DoesNotExist:
        return Response({'error': 'Show not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_price(request, show_id):
    try:
        show = Show.objects.get(pk=show_id)
        movie = show.movie
        screen = show.screen
        return Response({'price': show.price , 'title':movie.title , 'start_time':show.start_time, 'screen':screen.name}, status=status.HTTP_200_OK)
    except Show.DoesNotExist:
        return Response({'error': 'Show not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_categories(request):
    categories = Seat.CATEGORY_CHOICES
    return Response(categories)

@api_view(['POST'])
def validate_promo_code(request):
    promo_code = request.data.get('promo_code')
    current_date = timezone.now()
    total_amount = request.data.get('total_amount')
    try:
        promo = PromoCode.objects.get(code=promo_code)
        if promo.valid_from <= current_date <= promo.valid_to and promo.current_usage_count < promo.max_usage_count:
            # Calculate discount based on the type of discount
            if promo.discount_type == 'Percentage':
                discount = promo.discount_value / 100 * total_amount  # Adjust total_amount based on your implementation
            elif promo.discount_type == 'Fixed Amount':
                discount = promo.discount_value
            promo.current_usage_count += 1
            promo.save()
            return Response({'discount': discount})
        else:
            return Response({'error': 'Invalid promo code'})
    except PromoCode.DoesNotExist:
        return Response({'error': 'Invalid promo code'})
    

@api_view(['POST'])
def create_booking(request):
    if request.method == 'POST':
        # Deserialize data sent from frontend
        token = request.headers.get('Authorization', '').split(' ')[1]
        try:
            # Decode and verify the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            show_id = request.data.get('show_id')
            total_amount = request.data.get('total_amount')
            selected_seat_numbers = request.data.get('seat_numbers')  # List of selected seat numbers
            credit_card_number = request.data.get('credit_card_number')  # Get credit card number
            cvv = request.data.get('cvv')  # Get CVV
            expiry_date = request.data.get('expiry_date')

            booking_reference = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            # Create booking instance
            booking = Booking.objects.create(
                user_id=user_id,
                show_id=show_id,
                total_amount=total_amount,
                reference_number=booking_reference
            )

            booking.set_credit_card_number(credit_card_number)
            booking.set_cvv(cvv, fernet_key)
            booking.set_expiry_date(expiry_date, fernet_key)
            # Save selected seats for the booking
            for seat_number in selected_seat_numbers:
                seat = Seat.objects.get(show_id=show_id, seatNo=seat_number)
                booking.seats.add(seat)

            send_email_confirmation(user_id, show_id, total_amount, selected_seat_numbers , booking_reference)
            # Serialize booking instance to send as response
            serializer = BookingSerializer(booking)
            return Response(serializer.data)
        except jwt.ExpiredSignatureError:
            # Handle token expiration error
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        
        except jwt.InvalidTokenError:
            # Handle invalid token error
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            # Handle user not found error
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
    else:
        return Response({'error': 'Method not allowed'}, status=405)

def send_email_confirmation(user_id, show_id, total_amount, selected_seat_numbers, booking_reference):
    try:
        user = User.objects.get(pk=user_id)
        show = Show.objects.get(pk=show_id)
        

        subject = 'Booking Confirmation'
        message = f"Thank you for booking tickets for the show '{show.movie}'.\n"
        message += f"With booking id '{booking_reference}'.\n"
        message += f"showTime {show.start_time} at {show.screen}\n"
        message += f"Total Amount: ${total_amount}\n"
        message += f"Selected Seat Numbers: {', '.join(selected_seat_numbers)}\n"
        message += "Enjoy the show!"

        send_mail(subject, message, None, [user.email])
    except Exception as e:
        # Handle any exceptions that occur during email sending
        print(f"Error sending email confirmation: {e}")

@receiver(post_save, sender=PromoCode)
def send_promo_code_email(sender, instance, created, **kwargs):
    if created:
        users_with_promotions = User.objects.filter(promotions=True)
        for user in users_with_promotions:
            subject = 'New Promo Code Available!'
            message = render_to_string('/Users/manishvaleti/Desktop/SE Project/cinema_ticket_booking_system copy/cinema/theatre/templates/admin/email/promo_mail.html', {'user': user, 'promo_code': instance})
            recipient_list = [user.email]  # Assuming you have an email field in your User model
            send_mail(subject, message, None, recipient_list)


class OrderHistoryView(APIView):
    def get(self, request):
        # Retrieve the JWT token from the request headers
        token = request.headers.get('Authorization', '').split(' ')[1]

        try:
            # Decode and verify the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']

            # Get the user's order history
            bookings = Booking.objects.filter(user_id=user_id)
            serializer = BookingHistory(bookings, many=True)
            return Response(serializer.data)
        except jwt.ExpiredSignatureError:
            # Handle token expiration error
            return Response({'error': 'Token has expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            # Handle invalid token error
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            # Handle user not found error
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
# views.py

@api_view(['DELETE'])
def cancel_booking(request, booking_id):
    try:
        booking = Booking.objects.get(pk=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        # Get the seats associated with the booking
        seats = booking.seats.all()
        
        # Delete each seat individually
        for seat in seats:
            seat.delete()
        
        # Delete the booking
        booking.delete()
        
        return Response({"message": "Booking cancelled successfully"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['get'])
def booking_cred(request,booking_id):
    booking = Booking.objects.get(pk=booking_id)
    # k = booking
    print(booking.get_credit_card_number())