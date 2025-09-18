from rest_framework import serializers
from .models import CustomUser,UserProfile,Education,WorkExperience
from django.contrib.auth import get_user_model
class UserRegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['full_name', 'email', 'phone', 'password', 'confirm_password', 'profile_photo', 'resume']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')  # remove confirm_password before creating user
        user = CustomUser.objects.create_user(
        email=validated_data['email'],
        full_name=validated_data['full_name'],
        password=validated_data['password'],
        phone=validated_data.get('phone', ''),
        profile_photo=validated_data.get('profile_photo', None),
        resume=validated_data.get('resume', None),
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "full_name"]  # include more fields if needed

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"

class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = "__all__"

class UserProfileSerializer(serializers.ModelSerializer):
    # Nested serializers
    user = UserSerializer(read_only=True)  # ✅ show full user object instead of just ID
    educations = EducationSerializer(many=True, required=False)
    experiences = WorkExperienceSerializer(many=True, required=False)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",   # ✅ now will return full user data
            "dob",
            "gender",
            "contact",
            "address",
            "profile_photo",
            "resume",
            "skills",
            "languages",
            "educations",
            "experiences",
        ]
        read_only_fields = ["user"]

    def create(self, validated_data):
        educations_data = validated_data.pop("educations", [])
        experiences_data = validated_data.pop("experiences", [])

        profile = UserProfile.objects.create(**validated_data)

        for edu in educations_data:
            Education.objects.create(user_profile=profile, **edu)

        for exp in experiences_data:
            WorkExperience.objects.create(user_profile=profile, **exp)

        return profile

    def update(self, instance, validated_data):
        # Update basic profile info
        instance.dob = validated_data.get("dob", instance.dob)
        instance.gender = validated_data.get("gender", instance.gender)
        instance.contact = validated_data.get("contact", instance.contact)
        instance.address = validated_data.get("address", instance.address)
        instance.profile_photo = validated_data.get("profile_photo", instance.profile_photo)
        instance.resume = validated_data.get("resume", instance.resume)
        instance.skills = validated_data.get("skills", instance.skills)
        instance.languages = validated_data.get("languages", instance.languages)
        instance.save()

        # Handle nested education
        educations_data = validated_data.get("educations", [])
        for edu in educations_data:
            Education.objects.update_or_create(
                user_profile=instance,
                degree=edu.get("degree"),
                defaults=edu
            )

        # Handle nested work experience
        experiences_data = validated_data.get("experiences", [])
        for exp in experiences_data:
            WorkExperience.objects.update_or_create(
                user_profile=instance,
                company_name=exp.get("company_name"),
                designation=exp.get("designation"),
                defaults=exp
            )

        return instance
    
class AdminEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "degree", "university", "year_of_completion", "marks_cgpa"]
        read_only_fields = []  # admin can edit

class AdminWorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ["id", "company_name", "designation", "start_date", "end_date", "responsibilities"]
        read_only_fields = []  # admin can edit

class AdminUserProfileSerializer(serializers.ModelSerializer):
    membership_id = serializers.CharField(source="user.membership_id", read_only=True)
    educations = AdminEducationSerializer(many=True, required=False)
    experiences = AdminWorkExperienceSerializer(many=True, required=False)

    class Meta:
        model = UserProfile
        
       
            
        fields = [
            "id","membership_id", "dob", "gender", "contact", "address",
            "profile_photo", "resume", "skills", "languages",
            "educations", "experiences"
        ]
        read_only_fields = []
    def update(self, instance, validated_data):
        # --- Update profile fields ---
         if "profile_photo" in validated_data:
            instance.profile_photo = validated_data.pop("profile_photo")
        if "resume" in validated_data:
            instance.resume = validated_data.pop("resume")
            
        for field in ["dob", "gender", "contact", "address", "profile_photo", "resume", "skills", "languages"]:
            setattr(instance, field, validated_data.get(field, getattr(instance, field)))
        instance.save()

        # --- Update educations ---
        educations_data = validated_data.get("educations", [])
        for edu in educations_data:
            edu_id = edu.get("id")
            if edu_id:
                edu_instance = instance.educations.filter(id=edu_id).first()
                if edu_instance:
                    edu_serializer = AdminEducationSerializer(edu_instance, data=edu, partial=True)
                    edu_serializer.is_valid(raise_exception=True)
                    edu_serializer.save()
            else:
                Education.objects.create(user_profile=instance, **edu)

        # --- Update experiences ---
        experiences_data = validated_data.get("experiences", [])
        for exp in experiences_data:
            exp_id = exp.get("id")
            if exp_id:
                exp_instance = instance.experiences.filter(id=exp_id).first()
                if exp_instance:
                    exp_serializer = AdminWorkExperienceSerializer(exp_instance, data=exp, partial=True)
                    exp_serializer.is_valid(raise_exception=True)
                    exp_serializer.save()
            else:
                WorkExperience.objects.create(user_profile=instance, **exp)

        return instance

class AdminUserSerializer(serializers.ModelSerializer):
    profile = AdminUserProfileSerializer(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "email", "phone", "is_blocked", "profile"]

    def update(self, instance, validated_data):
        # --- Update CustomUser fields ---
        for field in ["full_name", "email", "phone", "is_blocked"]:
            setattr(instance, field, validated_data.get(field, getattr(instance, field)))
        instance.save()

        # --- Handle profile update ---
        profile_data = validated_data.get("profile")
        if profile_data:
            profile_instance = getattr(instance, "profile", None)
            if profile_instance:
                serializer = AdminUserProfileSerializer(profile_instance, data=profile_data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            else:
                profile_instance = UserProfile.objects.create(user=instance, **profile_data)

        return instance
class AdminUserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["is_active", "is_verified", "is_blocked"]