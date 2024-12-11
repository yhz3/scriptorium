# 0. Email missing
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice",
        "password": "Abcdefgh!1",
        "firstName": "alice",
        "lastName": "au"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "0. Email missing: Passed"
else
    echo "0. Email missing: Failed!!!"
fi


# 1. Password missing
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "1. Password missing: Passed"
else
    echo "1. Password missing: Failed!!!"
fi


# 2. Username missing
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "firstName": "alice",
        "password": "Abcdefgh!1",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "2. Username missing: Passed"
else
    echo "2. Username missing: Failed!!!"
fi


# 3. Short username
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "Bob",
        "password": "Abcdefgh!1",
        "firstName": "bob",
        "lastName": "bao",
        "email": "bob@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "3. Short username: Passed"
else
    echo "3. Short username: Failed!!!"
fi


# 4. Username invalid char
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "!Robert",
        "password": "Abcdefgh!1",
        "firstName": "bob",
        "lastName": "bao",
        "email": "bob@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "4. Username invalid char: Passed"
else
    echo "4. Username invalid char: Failed!!!"
fi


# 5. Successful Signup Alice
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
    echo "5. Signup Alice: Passed"
else
    echo "5. Signup Alice: Failed!!!"
fi


# 6. Duplicate Signup Alice with diff email
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice",
        "password": "Abcdefgh!1",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test123.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 409 ]; then
    echo "6. Duplicate Signup Alice with diff email: Passed"
else
    echo "6. Duplicate Signup Alice with diff email: Failed!!!"
fi


# 7. Duplicate Signup Alice with diff username
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice123",
        "password": "Abcdefgh!1",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 409 ]; then
    echo "7. Duplicate Signup Alice with diff username: Passed"
else
    echo "7. Duplicate Signup Alice with diff username: Failed!!!"
fi


# 8. Password too short
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice123",
        "password": "Aa1",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "8. Password too short: Passed"
else
    echo "8. Password too short: Failed!!!"
fi


# 9. Password no capital letter
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice123",
        "password": "a123123123",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "9. Password no capital letter: Passed"
else
    echo "9. Password no capital letter: Failed!!!"
fi


# 10. Password no number
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3000/api/user/signup" -H "Content-Type: application/json" -d '{
        "username": "alice123",
        "password": "Aaaaaaaaaaaaaa",
        "firstName": "alice",
        "lastName": "au",
        "email": "alice@test.com"
    }'
    )
sleep 0.1
if [ "$response" -eq 400 ]; then
    echo "10. Password no number: Passed"
else
    echo "10. Password no number: Failed!!!"
fi


# 11. Try login Alice
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/user/login" -H "Content-Type: application/json" -d '{
    "username": "alice",
    "password": "Abcdefgh!1"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "11. Try login Alice: Passed"
else
    echo "11. Try login Alice: Failed!!!"
fi
token=$(echo "$body" | jq -r '.accessToken')


# 12. Delete Alice
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3000/api/user/delete" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
        "password": "Abcdefgh!1"
    }'
    )
sleep 0.1
if [ "$response" -eq 200 ]; then
    echo "11. Delete Alice: Passed"
else
    echo "11. Delete Alice: Failed!!!"
fi
