from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.http import require_POST
from django.contrib import messages
from .models import Product, Category
from inventory.models import InventoryLog

def is_admin(user):
    return user.is_authenticated and user.profile.role == 'admin'

@login_required
def product_list(request):
    category_id = request.GET.get('category')
    search = request.GET.get('search', '')
    products = Product.objects.all()
    if category_id:
        products = products.filter(category_id=category_id)
    if search:
        products = products.filter(name__icontains=search)
    categories = Category.objects.all()
    return render(request, 'products/product_list.html', {
        'products': products,
        'categories': categories,
    })

@login_required
def menu_view(request):
    category_id = request.GET.get('category')
    search = request.GET.get('search', '')
    products = Product.objects.filter(is_available=True)
    if category_id:
        products = products.filter(category_id=category_id)
    if search:
        products = products.filter(name__icontains=search)
    categories = Category.objects.all()
    return render(request, 'products/menu.html', {
        'products': products,
        'categories': categories,
    })

@login_required
@user_passes_test(is_admin)
def product_create(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        category_id = request.POST.get('category')
        price = request.POST.get('price', '0')
        stock = request.POST.get('stock', '0')
        min_stock = request.POST.get('min_stock_level', '10')
        description = request.POST.get('description', '')
        image = request.FILES.get('image')
        if not name or not category_id:
            messages.error(request, 'Name and category are required.')
            return redirect('products:product_create')
        try:
            price = float(price)
            stock = int(stock)
            min_stock = int(min_stock)
        except (ValueError, TypeError):
            messages.error(request, 'Invalid price or stock values.')
            return redirect('products:product_create')
        category = Category.objects.get(id=category_id)
        product = Product.objects.create(
            name=name, category=category, price=price,
            stock=stock, min_stock_level=min_stock,
            description=description, image=image
        )
        InventoryLog.objects.create(
            product=product, user=request.user, action='add',
            quantity_change=stock, stock_before=0, stock_after=stock,
            notes='Initial stock'
        )
        messages.success(request, 'Product added successfully.')
        return redirect('products:product_list')
    categories = Category.objects.all()
    return render(request, 'products/product_form.html', {'categories': categories})

@login_required
@user_passes_test(is_admin)
def product_edit(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    if request.method == 'POST':
        old_stock = product.stock
        try:
            product.name = request.POST.get('name', product.name)
            product.category_id = int(request.POST.get('category', product.category_id))
            product.price = float(request.POST.get('price', product.price))
            product.stock = int(request.POST.get('stock', product.stock))
            product.min_stock_level = int(request.POST.get('min_stock_level', product.min_stock_level))
        except (ValueError, TypeError):
            messages.error(request, 'Invalid form data.')
            return redirect('products:product_edit', product_id=product.id)
        product.description = request.POST.get('description', '')
        product.is_available = request.POST.get('is_available') == 'on'
        if request.FILES.get('image'):
            product.image = request.FILES['image']
        product.save()
        new_stock = product.stock
        if old_stock != new_stock:
            InventoryLog.objects.create(
                product=product, user=request.user, action='update',
                quantity_change=new_stock - old_stock,
                stock_before=old_stock, stock_after=new_stock,
                notes='Manual stock update'
            )
        messages.success(request, 'Product updated successfully.')
        return redirect('products:product_list')
    categories = Category.objects.all()
    return render(request, 'products/product_form.html', {
        'product': product, 'categories': categories
    })

@login_required
@user_passes_test(is_admin)
@require_POST
def product_delete(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    messages.success(request, 'Product deleted.')
    return redirect('products:product_list')
