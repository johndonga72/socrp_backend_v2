from django.contrib import admin
from .models import CustomUser,UserProfile, Education, WorkExperience
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

# Inline classes to show related models inside UserProfile admin
class EducationInline(admin.TabularInline):
    model = Education
    extra = 1   # how many blank forms to show

class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 1

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "dob", "gender", "contact")
    search_fields = ("user__email", "user__full_name", "contact")
    inlines = [EducationInline, WorkExperienceInline]   # show related models inline

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("degree", "university", "year_of_completion", "marks_cgpa", "user_profile")
    search_fields = ("degree", "university", "user_profile__user__full_name")

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ("company_name", "designation", "start_date", "end_date", "user_profile")
    search_fields = ("company_name", "designation", "user_profile__user__full_name")