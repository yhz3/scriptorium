# 0. Register
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice",
        "password": "Abcdefgh!1",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 201 ]; then
    echo "0. Register: Passed"
else
    echo "0. Register: Failed!!!"
    echo "$body"
fi

sleep 1


# 1. Login
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/user/login" -H "Content-Type: application/json" -d '{
    "username": "alice",
    "password": "Abcdefgh!1"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "1. Login: Passed"
else
    echo "1. Login: Failed!!!"
    echo "$body"
fi
token=$(echo "$body" | jq -r '.accessToken')
refreshToken=$(echo "$body" | jq -r '.refreshToken')


# 2. Refresh
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/user/refresh" -H "Content-Type: application/json" -d "{
    \"refreshToken\": \"$refreshToken\"
}")
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "2. Refresh: Passed"
else
    echo "2. Refresh: Failed!!!"
    echo "$body"
fi
token=$(echo "$body" | jq -r '.accessToken')


# 3. Try logout with the new token
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/user/logout" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "{
    \"refreshToken\": \"$refreshToken\"
}")
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "3. Logout with new token: Passed"
else
    echo "3. Logout with new token: Failed!!!"
    echo "$body"
fi


# 4. Delete the user
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3000/api/user/delete" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
        "password": "Abcdefgh!1"
    }'
    )
sleep 0.1
if [ "$response" -eq 200 ]; then
    echo "4. Delete user: Passed"
else
    echo "4. Delete user: Failed!!!"
fi


# 5. Try logout with an invalid token
invalid_token="invalidtoken123"
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/user/logout" -H "Content-Type: application/json" -H "Authorization: Bearer $invalid_token" -d "{
    \"refreshToken\": \"$refreshToken\"
}")
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 401 ]; then
    echo "5. Logout with invalid token: Passed"
else
    echo "5. Logout with invalid token: Failed!!!"
    echo "$body"
fi


# 6. Try login with invalid credentials
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/user/login" -H "Content-Type: application/json" -d '{
    "username": "alice",
    "password": "wrongpassword"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 401 ]; then
    echo "6. Login with invalid credentials: Passed"
else
    echo "6. Login with invalid credentials: Failed!!!"
fi
