from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.contrib.auth.models import AbstractUser
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import base64
from django.utils import timezone
from django.utils.formats import date_format
from django.core.exceptions import ValidationError
from cryptography.fernet import Fernet
# from django.db.models import Q
class User(AbstractUser):
    photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True, default='default_image.png')
    address = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    credit_card_number = models.CharField(max_length=500,null=True, blank=True)  # Changed to BinaryField
    credit_card_expiry = models.DateField(null=True, blank=True)
    credit_card_cvv = models.CharField(max_length=500,null=True, blank=True)  # Changed to BinaryField
    promotions = models.BooleanField(default=False)
    key = models.BinaryField(null=True,blank=True)
    def encrypt_aes(self, data, key):
        cipher = AES.new(key, AES.MODE_CBC)
        ct_bytes = cipher.encrypt(pad(data.encode(), AES.block_size))
        iv = cipher.iv
        return iv, ct_bytes

    def decrypt_aes(self, iv, ct_bytes, key):
        cipher = AES.new(key, AES.MODE_CBC, iv=iv)
        pt = unpad(cipher.decrypt(ct_bytes), AES.block_size)
        return pt.decode()

    def save(self, *args, **kwargs):
        # Encrypt credit card details only if they are provided and the user instance is being created (not updated)
        if not self.pk and self.credit_card_number and self.credit_card_cvv:
            if not self.key:
                self.key = get_random_bytes(32)

            iv_ccn, encrypted_ccn = self.encrypt_aes(self.credit_card_number, self.key)
            iv_cvv, encrypted_cvv = self.encrypt_aes(self.credit_card_cvv, self.key)

            self.credit_card_number = base64.b64encode(iv_ccn + encrypted_ccn).decode().ljust(500, "=")
            self.credit_card_cvv = base64.b64encode(iv_cvv + encrypted_cvv).decode().ljust(500, "=")

        super(User, self).save(*args, **kwargs)

class Movie(models.Model):
    GENRE_CHOICES = [
        ('none', 'None'), 
        ('action', 'Action'),
        ('comedy', 'Comedy'),
        ('drama', 'Drama'),
        ('horror', 'Horror'),
        ('romance', 'Romance'),
        ('sci-fi', 'Science Fiction'),
    ]
    title = models.CharField(max_length=100)
    description = models.TextField()
    release_date = models.DateField()
    duration = models.IntegerField()  # Duration in minutes
    trailer_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='movie_images/', null=True, blank=True)
    genre = models.CharField(max_length=100, choices=GENRE_CHOICES, default='none')

    def __str__(self):
        return self.title

class Screen(models.Model):
    name = models.CharField(max_length=100)
    capacity = models.IntegerField()
    def __str__(self):
        return self.name

class Show(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        start_time_str = date_format(self.start_time, "SHORT_DATETIME_FORMAT")
        return f"{self.movie.title} @ {self.screen.name} - {start_time_str}"

    def clean(self):
        if self.start_time and self.screen:
            # Calculate end time of the show (3 hours after start time)
            duration = timezone.timedelta(hours=3)
            end_time = self.start_time + duration

            # Check for any conflicting shows scheduled in the same screen
            conflicting_shows = Show.objects.filter(
                screen=self.screen,
                start_time__lt=end_time,
                start_time__gte=self.start_time - duration
            ).exclude(pk=self.pk)
            
            if conflicting_shows.exists():
                # If there are conflicting shows, raise a validation error
                raise ValidationError("Another movie is scheduled within the next 3 hours in the same screen.")
        
   

class Seat(models.Model):
    CATEGORY_CHOICES = [
        ('ADULT', 'Adult'),
        ('CHILD', 'Child'),
        ('SENIOR', 'Senior Citizen'),
    ]
    show = models.ForeignKey(Show, on_delete=models.CASCADE, default=1)
    seatNo = models.CharField(max_length=3,default='A0')
    is_booked = models.BooleanField(default=False)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='ADULT')

    def __str__(self):
        return f"{self.show} - {self.seatNo} ({self.get_category_display()})"

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    show = models.ForeignKey(Show, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    booking_time = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    seats = models.ManyToManyField(Seat, related_name='bookings')
    reference_number = models.CharField(max_length=20, default='none')
    encrypted_credit_card_number = models.BinaryField(default=b'none')  # Encrypted credit card number
    encrypted_cvv = models.BinaryField(default=b'none')  # Encrypted CVV
    encrypted_expiry_date = models.BinaryField(default=b'none')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._cipher_suite = None

    @property
    def cipher_suite(self):
        if self._cipher_suite is None:
            # Initialize the cipher suite if it's not already set
            self._cipher_suite = Fernet(settings.FERNET_KEY)
        return self._cipher_suite

    def set_credit_card_number(self, credit_card_number):
        self.encrypted_credit_card_number = self.cipher_suite.encrypt(credit_card_number.encode())

    def get_credit_card_number(self):
        return self.cipher_suite.decrypt(self.encrypted_credit_card_number).decode()

    def set_cvv(self, cvv, fernet_key):
        cipher_suite = Fernet(fernet_key)
        self.encrypted_cvv = cipher_suite.encrypt(cvv.encode())

    def get_cvv(self, fernet_key):
        cipher_suite = Fernet(fernet_key)
        return cipher_suite.decrypt(self.encrypted_cvv).decode()
    
    def set_expiry_date(self, expiry_date, fernet_key):
        cipher_suite = Fernet(fernet_key)
        self.encrypted_expiry_date = cipher_suite.encrypt(expiry_date.encode())

    def get_expiry_date(self, fernet_key):
        cipher_suite = Fernet(fernet_key)
        return cipher_suite.decrypt(self.encrypted_expiry_date).decode() 

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
    def __str__(self):
        return self.code


