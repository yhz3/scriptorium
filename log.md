# Scriptorium

### Users
"http://localhost:3000/api/user/update"
- POST request:
    - The request body should have at least the following attributes:
        - username: must contain at least 5 chars
        - password: must contain at least 8 chars, containing at least an uppercase, a lowercase and a special char
        - firstName and lastName
        - Email: must be in valid email format
    - Duplication errors will be returned.
- DELETE request:
    - The request body should have at least one of the three, "id", "username" or "email". The database record will be removed if one valid argument is provided, or at least two valid arguments referring to the same observation. 

"http://localhost:3000/api/user/login"
- POST requests:
    - Login using (username & password) or (email & password), returns the access token and the refresh token

"http://localhost:3000/api/user/refresh"
- POST requests:
    - Given refresh token in request body, verify and return the new access token.

"http://localhost:3000/api/user/[id]"
- GET requests:
    - Given id, return the filtered user.