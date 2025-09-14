from django.urls import path
from .views import RegisterUser, VerifyEmail
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('verify/<str:uid>/', VerifyEmail.as_view(), name='verify-email'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]