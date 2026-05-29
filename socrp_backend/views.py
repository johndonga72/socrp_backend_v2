# app/views.py
import json
import razorpay
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from course.models import CourseOrder
import hmac, hashlib
from django.views.decorators.http import require_POST
import os
# Initialize client once
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
@csrf_exempt
def create_order(request):
    """
    POST payload: { "course_title": "...", "amount": 4999 }  # amount in rupees
    """
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST allowed")
    data = json.loads(request.body.decode())
    course_title = data.get("course_title")
    amount_rupees = data.get("amount")
    if not course_title or not amount_rupees:
        return HttpResponseBadRequest("Missing params")
    amount_paise = int(amount_rupees) * 100
    order = CourseOrder.objects.create(course_title=course_title, amount=amount_paise)
    razorpay_order = razorpay_client.order.create(dict(amount=amount_paise, currency="INR", receipt=str(order.id), payment_capture=1))
    order.razorpay_order_id = razorpay_order["id"]
    order.save()

    return JsonResponse({
        "order_id": razorpay_order["id"],
        "amount": amount_paise,
        "currency": razorpay_order["currency"],
        "key_id": settings.RAZORPAY_KEY_ID,  # send public key to frontend
        "our_order_id": order.id,
    })
@csrf_exempt
def verify_payment(request):
    """
    POST payload from frontend:
    { razorpay_payment_id, razorpay_order_id, razorpay_signature, our_order_id }
    """
    if request.method != "POST":
        return HttpResponseBadRequest("Only POST allowed")

    data = json.loads(request.body.decode())
    payment_id = data.get("razorpay_payment_id")
    order_id = data.get("razorpay_order_id")
    signature = data.get("razorpay_signature")
    our_order_id = data.get("our_order_id")

    if not (payment_id and order_id and signature and our_order_id):
        return HttpResponseBadRequest("Missing params")

    # Verify signature using razorpay utility
    try:
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }
        # This will raise ValueError if verification fails
        razorpay_client.utility.verify_payment_signature(params_dict)
    except Exception as e:
        return JsonResponse({"status": "error", "message": "Signature verification failed", "detail": str(e)}, status=400)
    try:
        order = CourseOrder.objects.get(id=our_order_id, razorpay_order_id=order_id)
    except CourseOrder.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Order not found"}, status=404)
    order.razorpay_payment_id = payment_id
    order.razorpay_signature = signature
    order.paid = True
    order.save()

    # TODO: trigger emails, grant course access, etc.

    return JsonResponse({"status": "success", "message": "Payment verified and order marked paid."})

#(continuation)
@csrf_exempt
@require_POST
def razorpay_webhook(request):
    webhook_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "")
    body = request.body
    signature = request.META.get("HTTP_X_RAZORPAY_SIGNATURE", "")
    generated_signature = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
    if generated_signature != signature:
        return JsonResponse({"status": "error", "message": "Invalid signature"}, status=400)
    payload = json.loads(body)
    return JsonResponse({"status": "ok"})
