from django.urls import path
from .views import RegisterUser, VerifyEmail

urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('verify/<str:uid>/', VerifyEmail.as_view(), name='verify-email'),
]