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


# 4. Comment on the blog
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/blogs/1/comments" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "content": "I agree"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "4. Comment on the blog: Passed"
else
    echo "4. Comment on the blog: Failed!!!"
    echo "$body"
fi


# 5. Comment on the comment
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/comments/1/replies" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "content": "I agree too"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 201 ]; then
    echo "5. Comment on the comment: Passed"
else
    echo "5. Comment on the comment: Failed!!!"
    echo "$body"
fi


# 6. Comment on a blog that does not exist
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/comments" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "blogId": 99999,
    "content": "I agree"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 404 ]; then
    echo "6. Comment on a blog that does not exist: Passed"
else
    echo "6. Comment on a blog that does not exist: Failed!!!"
    echo "$body"
fi


# 7. Query the comment in comments/[id].js
response=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/comments/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "7. Query the comment in comment/[id].js: Passed"
else
    echo "7. Query the comment in comment/[id].js: Failed!!!"
    echo "$body"
fi


# 8. PUT the comment in comments/[id].js
response=$(curl -s -w "\n%{http_code}" -X PUT "http://localhost:3000/api/comments/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
    "content": "real"
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "8. PUT the comment in comment/[id].js: Passed"
else
    echo "8. PUT the comment in comment/[id].js: Failed!!!"
    echo "$body"
fi


# 9. DELETE the comment in comments/[id].js
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/comments/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
}'
)
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "9. DELETE the comment in comments/[id].js: Passed"
else
    echo "9. DELETE the comment in comments/[id].js: Failed!!!"
    echo "$body"
fi


# 10. Try to DELETE a blog
response=$(curl -s -w "\n%{http_code}" -X DELETE "http://localhost:3000/api/blogs/1" -H "Content-Type: application/json" -H "Authorization: Bearer $token")
sleep 0.1
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$status_code" -eq 200 ]; then
    echo "10. Try to DELETE a blog: Passed"
else
    echo "10. Try to DELETE a blog: Failed!!!"
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
