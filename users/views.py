from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegisterSerializer
from .models import CustomUser
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class RegisterUser(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # This calls create_user() -> encrypts password & generates membership ID
            user.is_active = False
            user.save()
            # Send verification email
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verification_link = f"http://localhost:8000/api/verify/{uid}/"
            send_mail(
                subject="Verify your account",
                message=f"Click the link to verify your account: {verification_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({'msg': 'User registered successfully. Check your email for verification.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmail(APIView):
    def get(self, request, uid):
        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = get_object_or_404(CustomUser, pk=uid)
            user.is_verified = True
            user.save()
            return Response({'msg': 'Email verified successfully. You can now login.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Invalid verification link'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own profile
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Link the profile with the logged-in user
        if not UserProfile.objects.filter(user=self.request.user).exists():
            serializer.save(user=self.request.user)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['full_name'] = user.full_name
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
