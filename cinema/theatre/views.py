from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import UserSerializer
from .models import *

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
