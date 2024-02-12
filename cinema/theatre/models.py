from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    credit_card_number = models.CharField(max_length=20, null=True, blank=True)
    credit_card_expiry = models.DateField(null=True, blank=True)
    credit_card_cvv = models.CharField(max_length=4, null=True, blank=True)

    # Define related_name for groups and user_permissions
    groups = models.ManyToManyField(Group, related_name='custom_user_set')
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_permission_set')

class Movie(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    release_date = models.DateField()
    duration = models.IntegerField()  # Duration in minutes
    trailer_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='movie_images/', null=True, blank=True)

class Screen(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.IntegerField()

class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

class Seat(models.Model):
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE)
    row = models.CharField(max_length=1)  # A, B, C, ...
    number = models.IntegerField()
    is_booked = models.BooleanField(default=False)

class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    show = models.ForeignKey(Show, on_delete=models.CASCADE)
    booking_time = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

class PromoCode(models.Model):
    DISCOUNT_CHOICES = [
        ('Percentage', 'Percentage'),
        ('Fixed Amount', 'Fixed Amount'),
    ]
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_CHOICES)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    max_usage_count = models.IntegerField()
    current_usage_count = models.IntegerField(default=0)

class PromoCodeUsage(models.Model):
    promo_code = models.ForeignKey(PromoCode, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)
