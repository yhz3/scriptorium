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


# 3. POST the blog
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/blogs" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "title": "Ethan is cute",
    "description": "Descibing how cute Ethan is",
    "content": "Trust me bro, Ethan is really cute",
    "tagId": 1
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "3. POST the blog: Passed"
else
    echo "3. POST the blog: Failed!!!"
    echo "$body"
fi


# 4. Report the blog
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/blogs/report" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "blogId": 1,
    "description": "That is offensive."
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "4. Report the blog: Passed"
else
    echo "4. Report the blog: Failed!!!"
    echo "$body"
fi


# 4. Report the blog with an invalid blogId
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/blogs/report" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "blogId": 99999999,
    "description": "That is offensive."
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "4. Report the blog with an invalid blogId: Passed"
else
    echo "4. Report the blog with an invalid blogId: Failed!!!"
    echo "$body"
fi


# 5. GET the blogReport using id
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/reports/blogReports/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "5. GET the blogReport using id: Passed"
else
    echo "5. GET the blogReport using id: Failed!!!"
    echo "$body"
fi


# 6. GET the blogReport using an invalid id
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/reports/blogReports/99999999" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "6. GET the blogReport using an invalid id: Passed"
else
    echo "6. GET the blogReport using an invalid id: Failed!!!"
    echo "$body"
fi


# 7. PUT the blogReport
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/reports/blogReports/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "description": "nvm"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "7. PUT the blogReport: Passed"
else
    echo "7. PUT the blogReport: Failed!!!"
    echo "$body"
fi


# 8. PUT the blogReport using an invalid id
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/reports/blogReports/99999999" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "description": "nvm"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "8. PUT the blogReport using an invalid id: Passed"
else
    echo "8. PUT the blogReport using an invalid id: Failed!!!"
    echo "$body"
fi


# 9. DELETE the blogReport
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/reports/blogReports/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "9. DELETE the blogReport: Passed"
else
    echo "9. DELETE the blogReport: Failed!!!"
    echo "$body"
fi


# 10. DELETE the blogReport using an invalid id
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/reports/blogReports/99999999" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "10. DELETE the blogReport using an invalid id: Passed"
else
    echo "10. DELETE the blogReport using an invalid id: Failed!!!"
    echo "$body"
fi


# 11. Delete the user
response=$(
    curl -s -o /dev/null -w "%{http_code}" -X DELETE "http://localhost:3000/api/user/delete" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
        "password": "Abcdefgh!1"
    }'
    )
sleep 0.1
if [ "$response" -eq 200 ]; then
    echo "11. Delete the user: Passed"
else
    echo "11. Delete the user: Failed!!!"
fi
