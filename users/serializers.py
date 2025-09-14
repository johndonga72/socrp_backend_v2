from rest_framework import serializers
from .models import CustomUser,UserProfile,Education,WorkExperience

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
# UserProfile serializer
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "degree", "university", "year_of_completion", "marks_cgpa"]
# WorkExperience serializer
class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = ["id", "company_name", "designation", "start_date", "end_date", "responsibilities"]
# UserProfile serializer with nested education and experience
class UserProfileSerializer(serializers.ModelSerializer):
    # Nested serializers
    educations = EducationSerializer(many=True, required=False)
    experiences = WorkExperienceSerializer(many=True, required=False)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",   # maps to CustomUser (FK)
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
