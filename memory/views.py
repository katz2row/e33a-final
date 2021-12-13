import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.shortcuts import HttpResponseRedirect, render
from django.urls import reverse
from datetime import datetime, timedelta

from .models import User

# Create your views here.
def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "memory/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))

#Add win information to user record.
@login_required
def gamewon(request, profile_name):
    if request.method == "PUT":
        try:
            currentUser = User.objects.get(username=profile_name)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)

        data = json.loads(request.body)
        game_moves = data["gameMoves"]
        game_time = data["gameTime"]

        if currentUser.best_moves is None or int(game_moves) < int(currentUser.best_moves): #If moves are less than current or current is blank, update. Otherwise, ignore.
            currentUser.best_moves = game_moves
        if currentUser.best_time is None or int(game_time) < int(currentUser.best_time): #If time is less than current or current is blank, update. Otherwise, ignore.
            currentUser.best_time = game_time

        currentUser.last_win = datetime.now()
        currentUser.number_of_wins = int(currentUser.number_of_wins or 0) + 1 #Includes 0 as OR in case game has never been won.
        currentUser.save()

    return render(request, "memory/index.html")

#Get the users who have won for the Winners Circle.
@login_required
def winnerscircle(request):
    all_winners = User.objects.exclude(number_of_wins__isnull=True).all()

    return render(request, "memory/winnerscircle.html", {
        'all_winners': all_winners
    })

#Allow users to login.
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))

        else:
            return render(request, "memory/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "memory/login.html")

#Allow users to logout.
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

#Allow users to register.
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        first_name = request.POST["first_name"]
        last_name = request.POST["last_name"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "memory/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password) #Name is added separately becuase of create_user limitation.
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        except IntegrityError:
            return render(request, "memory/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))

    else:
        return render(request, "memory/register.html")

# Profile view
@login_required
def profile(request, profile_name):
    profile_user = User.objects.get(username=profile_name)
    follower_count = profile_user.followers.count()
    follower_list = profile_user.followers.all()
    following_count = profile_user.following.count()
    following_list = profile_user.following.all()
    following_user = False

    # If user is authenticated, allow to follow/unfollow
    if request.user.is_authenticated:
        follow_list = request.user.following.all()

        if profile_user in follow_list:
            following_user = True

        if 'follow' in request.POST:  # add displayed user to following
            request.user.following.add(profile_user)

            return HttpResponseRedirect(reverse("profile", args=(profile_name,)))
        if 'unfollow' in request.POST:  # remove displayed user from following
            request.user.following.remove(profile_user)

            return HttpResponseRedirect(reverse("profile", args=(profile_name,)))

    if profile_user.best_time is None:
        best_time = "None"
    else: 
        best_time = str(timedelta(seconds=profile_user.best_time))

    return render(request, "memory/profile.html", {
        'profile_user': profile_user,
        'following_user': following_user,
        'follower_count': follower_count,
        'following_count': following_count,
        'follower_list': follower_list,
        'following_list': following_list,
        'total_wins': profile_user.number_of_wins,
        'best_moves': profile_user.best_moves,
        'best_time': best_time,
        'last_win': profile_user.last_win,
    })
