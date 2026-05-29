
# app/models.py
from django.db import models

class CourseOrder(models.Model):
    course_title = models.CharField(max_length=200)
    amount = models.IntegerField()
    razorpay_order_id = models.CharField(max_length=200, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=200, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=500, blank=True, null=True)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.course_title} - {self.amount} - paid:{self.paid}"
