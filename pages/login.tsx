import React, { useState, useContext, useEffect } from 'react';
import "tailwindcss/tailwind.css";
import { Header } from '.';
import { SignupTextbox } from './signup';
import { PasswordTextbox } from './signup';
import Image from 'next/image';
import { SubmitButton } from '@/components/signup/SignupButton';
import axios from 'axios';
import { useRouter } from 'next/router';

import CurrentUserProvider, { CurrentUserContext, getCurrentUser } from '@/context/CurrentUserContext';

// The fun stuff
import signupCat from '@/resources/images/signup/signup_cat.png';
import signupCatClosedEye from "@/resources/images/signup/signup_cat_closed_eye.png";
import signupCatWaving from "@/resources/images/signup/signup_cat_waving.png";
import { ThemeProvider } from 'next-themes';


const Login = (): JSX.Element => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // For the cat
    const [catHover, setCatHover] = useState(false);
    const [passwordEntering, setPasswordEntering] = useState(false);

    const router = useRouter();
    const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

    // For debug
    useEffect(() => {
        if (currentUser) {
          console.log(JSON.stringify(currentUser));
        }
      }, [currentUser]);
    
    let user = getCurrentUser();
    console.log(JSON.stringify(user));

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '75vh'
            }}>
                <form style={{ width: '500px', paddingBottom: '40px' }}
                    onSubmit={(e) => {
                        e.preventDefault();

                        // Check for input validity
                        if (username.trim().length === 0) {
                            alert("Please enter a valid username.");
                        } else if (password.trim().length === 0) {
                            alert("Please enter a valid password.");
                        } else {
                            axios.post('/api/user/login', {
                                username,
                                password
                            }, {
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }).then(response => {
                                // Success push
                                // login(username, password, authContext.setUser);

                                const userObj = {
                                    username: response.data.user.username,
                                    email: response.data.user.email,
                                    firstName: response.data.user.firstName,
                                    lastName: response.data.user.lastName
                                }
                                setCurrentUser(userObj);

                                localStorage.setItem("accessToken", response.data.accessToken);
                                localStorage.setItem("refreshToken", response.data.refreshToken);
                                console.log("accessToken: " + localStorage.getItem("accessToken") + '\n');
                                console.log("refreshToken: " + localStorage.getItem("refreshToken") + '\n');
                                alert("Login success! You're in!");
                                router.push('/');
                            })
                                .catch(error => {

                                    // Access the custom error message from the server
                                    if (error.response && error.response.data && error.response.data.error) {
                                        alert(error.response.data.error);
                                    } else {
                                        // Fallback to a generic error message
                                        alert('Login failed: ' + error.message);
                                    }
                                });
                        }
                    }}>
                    <h1 className='text-black dark:text-white' style={{ textAlign: 'center', paddingBottom: '40px', fontSize: '20px', fontFamily: 'monospace' }}>Welcome back!</h1>
                    <SignupTextbox content="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <div style={{ paddingBottom: '20px' }}>
                        <PasswordTextbox content="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onPasswordEnterChange={setPasswordEntering} />
                    </div>

                    <SubmitButton content="Let's go!" />
                </form>
            </div>


            {/* Cat */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
            }}>
                <Image
                    src={
                        passwordEntering ? signupCatClosedEye : (catHover ? signupCat : signupCatWaving)
                    }
                    alt="Signup Cat"
                    width={150}
                    height={150}
                    onMouseOver={() => setCatHover(true)}
                    onMouseOut={() => setCatHover(false)} />

            </div>
        </div>
    )
}

/**
 * The page itself.
 */
const Page = (): JSX.Element => {
    return (
        <ThemeProvider attribute="class" defaultTheme="system">
            <div 
                style={{ minHeight: '100vh', fontFamily: "Helvetica" }}
                className='bg-gray-50 dark:bg-black transition-colors'
            >
                <Header content="Login" />
                <Login />
            </div>
        </ThemeProvider>
    )
}
export default Page;