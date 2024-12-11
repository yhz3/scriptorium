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
sleep 1
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
echo $token

sleep 1

# 2. Register the tag
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/tags" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "name": "CSC309"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "2. Tag registeration: Passed"
else
    echo "2. Tag registeration: Failed!!!"
    echo "$body"
fi


# 3. Query the tags without any search argument
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/tags" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "3. Query the tags without any search argument: Passed"
else
    echo "3. Query the tags without any search argument: Failed!!!"
    echo "$body"
fi


# 4. Query the tags with search argument
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/tags" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -G --data-urlencode "name=CSC309")
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "4. Query the tags with search argument: Passed"
else
    echo "4. Query the tags with search argument: Failed!!!"
    echo "$body"
fi



# 5. GET a tag in [id].js
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/tags/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" )
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "5. GET a tag in [id].js: Passed"
else
    echo "5. GET a tag in [id].js: Failed!!!"
    echo "$body"
fi


# 6. PUT a tag in [id].js
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/tags/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "name": "CSC311"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "6. PUT a tag in [id].js: Passed"
else
    echo "6. PUT a tag in [id].js: Failed!!!"
    echo "$body"
fi

# 7. DELETE a tag in [id].js
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/tags/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" )
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "7. DELETE a tag in [id].js: Passed"
else
    echo "7. DELETE a tag in [id].js: Failed!!!"
    echo "$body"
fi


# 8. GET a tag that doesn't exist anymore
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/tags/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" )
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "8. GET a tag that doesn't exist anymore: Passed"
else
    echo "8. GET a tag that doesn't exist anymore: Failed!!!"
    echo "$body"
fi


# 9. PUT a tag that doesn't exist anymore
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/tags/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "name": "CSC311"
}')
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "9. PUT a tag that doesn't exist anymore: Passed"
else
    echo "9. PUT a tag that doesn't exist anymore: Failed!!!"
    echo "$body"
fi

# 10. DELETE a tag that doesn't exist anymore
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/tags/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" )
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "7. DELETE a tag in [id].js: Passed"
else
    echo "7. DELETE a tag in [id].js: Failed!!!"
    echo "$body"
fi

# 11. Register a tag without any attribute
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/tags" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 400 ]; then
    echo "11. Register a tag without any attribute: Passed"
else
    echo "11. Register a tag without any attribute: Failed!!!"
    echo "$body"
fi


# 12. Delete the user
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3000/api/user/delete" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
        "password": "Abcdefgh!1"
    }'
    )
sleep 0.1
if [ "$response" -eq 200 ]; then
    echo "12. Delete the user: Passed"
else
    echo "12. Delete the user: Failed!!!"
fi
