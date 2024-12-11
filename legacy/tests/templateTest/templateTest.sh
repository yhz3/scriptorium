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


# 2. POST a template
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/templates" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "title": "CSC309 Default Template",
    "explanation": "The default CSC309 Programming on the web template",
    "code": "console.log(\"HelloWorld!\");",
    "language": "javascript"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "2. POST a template: Passed"
else
    echo "2. POST a template: Failed!!!"
    echo "$body"
fi


# 3. POST a template with an unsupported language
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/templates" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "title": "CSC311 Default Template",
    "explanation": "The default CSC311 Programming on the web template",
    "code": "console.log("HelloWorld2!");",
    "language": "golang"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 400 ]; then
    echo "3. POST a template with an unsupported language: Passed"
else
    echo "3. POST a template with an unsupported language: Failed!!!"
    echo "$body"
fi


# 4. GET all templates without any query param
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/templates" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "4. GET all templates without any query param: Passed"
else
    echo "4. GET all templates without any query param: Failed!!!"
    echo "$body"
fi


# 5. Adding a duplicated template with the same title given the same user
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/templates" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "title": "CSC309 Default Template",
    "explanation": "The default CSC309 Programming on the web template",
    "code": "console.log(\"HelloWorld!\");",
    "language": "javascript"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 400 ]; then
    echo "5. Adding a duplicated template with the same title given the same user: Passed"
else
    echo "5. Adding a duplicated template with the same title given the same user: Failed!!!"
    echo "$body"
fi


# 6. GET the template using id
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/templates/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "6. GET the template using id: Passed"
else
    echo "6. GET the template using id: Failed!!!"
    echo "$body"
fi


# 7. PUT the template using id
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/templates/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "title": "changed"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "7. PUT the template using id: Passed"
else
    echo "7. PUT the template using id: Failed!!!"
    echo "$body"
fi

# 8. DELETE the template using id
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/templates/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "8. DELETE the template using id: Passed"
else
    echo "8. DELETE the template using id: Failed!!!"
    echo "$body"
fi


# 9. Delete the user
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3000/api/user/delete" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
        "password": "Abcdefgh!1"
    }'
    )
sleep 0.1
if [ "$response" -eq 200 ]; then
    echo "9. Delete the user: Passed"
else
    echo "9. Delete the user: Failed!!!"
fi
