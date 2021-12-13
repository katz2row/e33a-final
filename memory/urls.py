from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:profile_name>", views.profile, name="profile"),
    path("winnerscircle", views.winnerscircle, name="winnerscircle"),

    path("profile/<str:profile_name>/win", views.gamewon, name="gamewon")
]
