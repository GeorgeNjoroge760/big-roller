import requests, json

# Login
r = requests.post('http://localhost:8000/api/auth/login/',
    json={'username': 'admin', 'password': 'admin123'})
print('Login:', r.status_code)
if r.status_code == 200:
    data = r.json()
    token = data['access']
    print('Token:', token[:50])
    print('User:', data['user']['username'], '-', data['user']['profile']['role'])

    headers = {'Authorization': f'Bearer {token}'}

    # Categories
    r = requests.get('http://localhost:8000/api/categories/', headers=headers)
    print('Categories:', r.status_code, len(r.json()))

    # Products
    r = requests.get('http://localhost:8000/api/products/', headers=headers)
    print('Products:', r.status_code, len(r.json()))

    # Dashboard
    r = requests.get('http://localhost:8000/api/dashboard/', headers=headers)
    print('Dashboard:', r.status_code, r.json())

    # Orders
    r = requests.get('http://localhost:8000/api/orders/', headers=headers)
    print('Orders:', r.status_code, len(r.json()))
else:
    print('Error:', r.text)
