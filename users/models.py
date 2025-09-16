# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from datetime import datetime
from django.conf import settings
import random
import uuid
from datetime import timedelta
from django.utils import timezone

# 1️⃣ Create a user manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)  # encrypt password
        # auto-generate membership ID
        user.membership_id = f"SOCRP-{datetime.now().year}-{random.randint(10000,99999)}"
        user.save()
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, full_name, password, **extra_fields)


# 2️⃣ Custom user model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    membership_id = models.CharField(max_length=20, unique=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return self.email
    
# users/models.py
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")

    # Editable profile fields
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[("M", "Male"), ("F", "Female"), ("O", "Other")], blank=True)
    contact = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    profile_photo = models.ImageField(upload_to="profiles/", blank=True, null=True)

    # Extra info
    skills = models.TextField(blank=True)
    languages = models.TextField(blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)

    def __str__(self):
        return f"{self.user.full_name}'s Profile"
#education model
class Education(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="educations")
    degree = models.CharField(max_length=255)
    university = models.CharField(max_length=255)
    year_of_completion = models.IntegerField()
    marks_cgpa = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.degree} - {self.university} ({self.year_of_completion})"
#work experience model
class WorkExperience(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="experiences")
    company_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    responsibilities = models.TextField()

    def __str__(self):
        return f"{self.company_name} - {self.designation} ({self.start_date} to {self.end_date or 'Present'})"

class ProfileShareLink(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="share_links")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    expiry_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() < self.expiry_date
    class Meta:
        indexes = [
            models.Index(fields=["token"]),
            models.Index(fields=["expiry_date"]),
        ]
class ProfileViewLog(models.Model):
    share_link = models.ForeignKey(ProfileShareLink, on_delete=models.CASCADE, related_name="logs")
    viewer_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        indexes = [
            models.Index(fields=["share_link"]),
            models.Index(fields=["viewed_at"]),
        ]
   
