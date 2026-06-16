$(document).ready(function() {
    $('.alert-dismissible .btn-close').on('click', function() {
        $(this).closest('.alert').fadeOut(300);
    });

    $('[data-bs-toggle="tooltip"]').tooltip();

    setTimeout(function() {
        $('.alert').not('.alert-permanent').fadeOut(500);
    }, 5000);

    $('.search-input').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        var target = $(this).data('target');
        $(target + ' .search-item').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    $('.select-all').on('change', function() {
        $('.select-item').prop('checked', this.checked);
    });

    function updateNotifBadge() {
        $.get('/notifications/unread-count/', function(data) {
            var badge = $('#notif-badge');
            if (data.count > 0) {
                if (badge.length) {
                    badge.text(data.count);
                } else {
                    $('.navbar .bi-bell').parent().append(
                        '<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="notif-badge">' + data.count + '</span>'
                    );
                }
            } else {
                badge.remove();
            }
        });
    }

    setInterval(updateNotifBadge, 30000);
});

function confirmDelete(message) {
    return confirm(message || 'Are you sure you want to delete this?');
}

function updateCartBadge() {
    var items = JSON.parse(localStorage.getItem('cart') || '[]');
    var total = items.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    var badge = $('#cart-badge');
    if (total > 0) {
        if (!badge.length) {
            $('#cart-btn').append('<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cart-badge">' + total + '</span>');
        } else {
            badge.text(total);
        }
    } else if (badge.length) {
        badge.remove();
    }
}

function addToCart(productId, name, price) {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
    var existing = cart.find(function(item) { return item.id == productId; });
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({id: productId, name: name, price: parseFloat(price), quantity: 1});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
    showToast('Added to cart', name + ' added to your order');
}

function removeFromCart(productId) {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(function(item) { return item.id != productId; });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function updateCartQty(productId, delta) {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
    var item = cart.find(function(i) { return i.id == productId; });
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartBadge();
    }
}

function renderCart() {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
    var $list = $('#cart-items');
    var $total = $('#cart-total');
    var $empty = $('#cart-empty');
    if (!cart.length) {
        $list.html('');
        $total.text('0.00');
        if ($empty) $empty.show();
        return;
    }
    if ($empty) $empty.hide();
    var html = '';
    var total = 0;
    cart.forEach(function(item) {
        var subtotal = item.price * item.quantity;
        total += subtotal;
        html += '<div class="d-flex justify-content-between align-items-center p-3 border-bottom border-dark">';
        html += '<div><h6 class="mb-0">' + item.name + '</h6>';
        html += '<small class="text-muted">Ksh ' + item.price.toFixed(2) + '</small></div>';
        html += '<div class="d-flex align-items-center gap-2">';
        html += '<button class="btn btn-sm btn-outline-secondary" onclick="updateCartQty(' + item.id + ', -1)">-</button>';
        html += '<span class="fw-bold">' + item.quantity + '</span>';
        html += '<button class="btn btn-sm btn-outline-secondary" onclick="updateCartQty(' + item.id + ', 1)">+</button>';
        html += '<button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart(' + item.id + ')"><i class="bi bi-trash"></i></button>';
        html += '</div></div>';
    });
    $list.html(html);
    $total.text(total.toFixed(2));
}

function submitOrder() {
    var cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.length) {
        showToast('Error', 'Cart is empty', 'danger');
        return;
    }
    var $form = $('#order-form');
    cart.forEach(function(item) {
        $form.append('<input type="hidden" name="items[]" value="' + item.id + '">');
        $form.append('<input type="hidden" name="quantities[]" value="' + item.quantity + '">');
    });
    $form.submit();
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartBadge();
    renderCart();
}

function showToast(title, message, type) {
    type = type || 'success';
    var toastHtml = '<div class="toast align-items-center text-bg-' + type + ' border-0 show position-fixed bottom-0 end-0 m-3" role="alert" style="z-index: 9999;">';
    toastHtml += '<div class="d-flex"><div class="toast-body"><strong>' + title + ':</strong> ' + message + '</div>';
    toastHtml += '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>';
    var $toast = $(toastHtml);
    $('body').append($toast);
    setTimeout(function() { $toast.remove(); }, 4000);
}

function printReceipt() {
    window.print();
}

function downloadReport(reportId) {
    window.open('/reports/' + reportId + '/download/', '_blank');
}
