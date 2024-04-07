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
        movies = Movie.objects.all()
        serializer = MovieSerializer(movies, many=True)
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
    global t
    t = user
    if user is not None:
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
        return Response(False, status=status.HTTP_401_UNAUTHORIZED)
    
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
    # def decrypt_aes(self, iv, ct_bytes, key):
    #     cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    #     decryptor = cipher.decryptor()
    #     pt = decryptor.update(ct_bytes) + decryptor.finalize()
    #     unpadder = padding.PKCS7(128).unpadder()
    #     pt = unpadder.update(pt) + unpadder.finalize()
    #     return pt.decode()

    def get(self, request, *args, **kwargs):
        # Get the JWT token from the request headers
        token = request.headers.get('Authorization', '').split(' ')[1]

        try:
            # Decode and verify the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            
            # Get user details based on the decoded user_id
            user = User.objects.get(id=user_id)
            
            # Decode and decrypt credit card number
            ccn_data = base64.b64decode(user.credit_card_number)
            iv_ccn = ccn_data[:16]  # Extract IV
            encrypted_ccn = ccn_data[16:]  # Extract encrypted data
            ccn = self.decrypt_aes(iv_ccn, encrypted_ccn, user.key)

            # Decode and decrypt CVV
            cvv_data = base64.b64decode(user.credit_card_cvv)
            iv_cvv = cvv_data[:16]  # Extract IV
            encrypted_cvv = cvv_data[16:]  # Extract encrypted data
            try:
                cvv = self.decrypt_aes(iv_cvv, encrypted_cvv, user.key)
            except Exception as e:
    # Handle decryption error
                print(f"Error during decryption: {e}")
                return Response({'error': 'Decryption failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Serialize user details with decrypted card details
            serializer = UserSerializer(user)
            data = serializer.data
            data['credit_card_number'] = ccn
            data['credit_card_cvv'] = cvv
            print(data,ccn,cvv)
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
        return Response({'price': show.price , 'title':movie.title , 'start_time':show.start_time}, status=status.HTTP_200_OK)
    except Show.DoesNotExist:
        return Response({'error': 'Show not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def get_categories(request):
    categories = Seat.CATEGORY_CHOICES
    return Response(categories)