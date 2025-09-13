from django.contrib import admin
from .models import CustomUser

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("email", "full_name", "phone", "membership_id", "is_active")
    list_filter = ("is_active", "is_staff", "is_superuser")
    search_fields = ("email", "full_name", "membership_id")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name", "phone", "profile_photo", "resume")}),
        ("Membership", {"fields": ("membership_id", "is_active")}),
        ("Permissions", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "phone", "password1", "password2", "is_active")}
        ),
    )

admin.site.register(CustomUser, CustomUserAdmin)
