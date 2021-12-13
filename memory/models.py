from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    following = models.ManyToManyField('User', null=True, blank=True, related_name='followers')
    number_of_wins = models.IntegerField('Wins', blank=True, null=True)
    best_moves = models.IntegerField('Best Moves', blank=True, null=True)
    last_win = models.DateTimeField('Last Win', blank=True, null=True)
    best_time = models.IntegerField('Best Time', blank=True, null=True)