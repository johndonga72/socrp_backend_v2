from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserRegisterSerializer
from .models import CustomUser,ProfileShareLink, ProfileViewLog
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
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAdminUser
from django.db.models import Count, Q
import logging

from .serializers import (
    AdminUserSerializer,
    AdminUserStatusSerializer,
    AdminUserProfileSerializer,
)
from django.utils import timezone
from datetime import timedelta

class RegisterUser(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # This calls create_user() -> encrypts password & generates membership ID
            user.is_active = False
            user.save()
            # Send verification email
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verification_link = f"https://socrp-frontend-v2-2.onrender.com/verify/{uid}/"
            send_mail(
                subject="Verify your account",
                message=f"Click the link to verify your account: {verification_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({'msg': 'User registered successfully. Check your email for verification.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([AllowAny])
class VerifyEmail(APIView):
    permission_classes = [AllowAny]
    def get(self, request, uid):
        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = get_object_or_404(CustomUser, pk=uid)
            if not user.is_active:
                user.is_active = True
                user.save()
                return Response({"msg": "Email verified successfully. You can now login."}, status=status.HTTP_200_OK)
            else:
                return Response({"msg": "Email already verified."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid or expired verification link'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if not UserProfile.objects.filter(user=self.request.user).exists():
            serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def me(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        if profile:
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        # fallback: just return user data
        return Response({
            "user": {
                "id": request.user.id,
                "email": request.user.email,
                "full_name": request.user.full_name
            }
        })

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
    
class GenerateShareLink(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        days = int(request.data.get("days", 1))
        if days not in [1, 2, 7]:
            return Response({"error": "Invalid expiry option"}, status=status.HTTP_400_BAD_REQUEST)

        expiry = timezone.now() + timedelta(days=days)
        link = ProfileShareLink.objects.create(user=request.user, expiry_date=expiry)

        share_url = f"https://socrp-frontend-v2-2.onrender.com/shared-profile/{link.token}"
        return Response({"share_url": share_url, "expiry_date": expiry}, status=status.HTTP_201_CREATED)
class SharedProfileView(APIView):
    permission_classes = [permissions.AllowAny]  # Anyone with link can view

    def get(self, request, token):
        share_link = get_object_or_404(ProfileShareLink, token=token)

        if not share_link.is_valid():
            return Response({"error": "Link expired"}, status=status.HTTP_410_GONE)

        # Log the view
        ProfileViewLog.objects.create(
            share_link=share_link,
            viewer_ip=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", "")
        )

        # Return profile details (you already have serializer → reuse it)
        user = share_link.user
        return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)
logger = logging.getLogger(__name__)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().select_related("profile")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

    # List all users with profiles
    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = AdminUserSerializer(users, many=True)
        data = serializer.data

        # inject membership_id into each user JSON
        for i, user in enumerate(users):
            data[i]["membership_id"] = getattr(user, "membership_id", None) or getattr(user.user, "membership_id", None)

        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = AdminUserSerializer(user)
        data = serializer.data

        # inject membership_id into single user JSON
        data["membership_id"] = getattr(user, "membership_id", None) or getattr(user.user, "membership_id", None)

        return Response(data)
    # Update user and profile
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # Block a user
    @action(detail=True, methods=["post"], url_path="block")
    def block_user(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = True
        user.save()
        serializer = AdminUserSerializer(user)
        return Response({"message": f"User {user.email} blocked", "user": serializer.data})

    # Unblock a user
    @action(detail=True, methods=["post"], url_path="unblock")
    def unblock_user(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = False
        user.save()
        serializer = AdminUserSerializer(user)
        return Response({"message": f"User {user.email} unblocked", "user": serializer.data})
@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(request, email=email, password=password)
    if not user:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_staff:
        return Response({"error": "Not authorized as admin"}, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)
    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "is_staff": user.is_staff
        }
    })

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_stats(request):
    stats = CustomUser.objects.aggregate(
        total_users=Count("id"),
        active_users=Count("id", filter=Q(is_active=True, is_blocked=False)),
        blocked_users=Count("id", filter=Q(is_blocked=True)),
        pending_users=Count("id", filter=Q(is_active=False, is_blocked=False)),
    )
    return Response(stats)