from django.urls import path,include
from .views import RegisterUser, VerifyEmail,GenerateShareLink, SharedProfileView
from .views import MyTokenObtainPairView,AdminUserViewSet,admin_stats,admin_login
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r"admin/users", AdminUserViewSet, basename="admin-users")
urlpatterns = [
    path('register/', RegisterUser.as_view(), name='register'),
    path('verify/<str:uid>/', VerifyEmail.as_view(), name='verify-email'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("", include(router.urls)),
    path("admin/stats/", admin_stats, name="admin-stats"),
    path("admin/login/", admin_login, name="admin-login"),
    path("profile/share/generate/", GenerateShareLink.as_view(), name="generate_share_link"),
    path("profile/share/<uuid:token>/", SharedProfileView.as_view(), name="shared_profile"),
    
]