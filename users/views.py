from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User, Group
from .models import UserProfile

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboards:home')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect('dashboards:home')
        else:
            messages.error(request, 'Invalid username or password.')
    return render(request, 'users/login.html')

@login_required
def logout_view(request):
    logout(request)
    return redirect('users:login')

@login_required
def profile_view(request):
    return render(request, 'users/profile.html')

@login_required
def user_list(request):
    if not request.user.profile.role == 'admin':
        messages.error(request, 'Access denied.')
        return redirect('dashboards:home')
    users = User.objects.all().select_related('profile')
    return render(request, 'users/user_list.html', {'users': users})

@login_required
def user_create(request):
    if not request.user.profile.role == 'admin':
        messages.error(request, 'Access denied.')
        return redirect('dashboards:home')
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '')
        password = request.POST.get('password', '')
        role = request.POST.get('role', 'waiter')
        phone = request.POST.get('phone', '')
        if not username or not password:
            messages.error(request, 'Username and password are required.')
            return redirect('users:user_create')
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.profile.role = role
            user.profile.phone = phone
            user.profile.save()
            group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(group)
            messages.success(request, f'User {username} created successfully.')
            return redirect('users:user_list')
    return render(request, 'users/user_form.html')

@login_required
def user_edit(request, user_id):
    if not request.user.profile.role == 'admin':
        messages.error(request, 'Access denied.')
        return redirect('dashboards:home')
    user = User.objects.get(id=user_id)
    if request.method == 'POST':
        user.email = request.POST.get('email', user.email)
        user.profile.role = request.POST.get('role', user.profile.role)
        user.profile.phone = request.POST.get('phone', '')
        password = request.POST.get('password')
        if password:
            user.set_password(password)
        user.save()
        user.profile.save()
        user.groups.clear()
        group, _ = Group.objects.get_or_create(name=user.profile.role)
        user.groups.add(group)
        messages.success(request, 'User updated successfully.')
        return redirect('users:user_list')
    return render(request, 'users/user_form.html', {'edit_user': user})
