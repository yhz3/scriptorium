import React, { useState, useContext } from 'react';
import "tailwindcss/tailwind.css";
import { Header } from '.';
import Image from 'next/image';
import signupCat from '@/resources/images/signup/signup_cat.png';
import signupCatClosedEye from "@/resources/images/signup/signup_cat_closed_eye.png";
import signupCatWaving from "@/resources/images/signup/signup_cat_waving.png";
import { SubmitButton } from '@/components/signup/SignupButton';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ThemeProvider, useTheme } from 'next-themes';

/**
 * An user entity.
 */
interface User {
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    avatar: string,
    phoneNumber: string
}


export function usernameCheck(username: string) {
    const isValidLength = username.length >= 5;
    const isValidFormat = /^[a-zA-Z0-9_]+$/.test(username);

    if (!isValidLength) {
        return { status: false, message: "Username must be at least 5 characters long." };
    }
    if (!isValidFormat) {
        return { status: false, message: "Username must contain only letters, numbers and underscores." };
    }
    return { status: true, message: "Username is valid." };
}


/**
 * Checking the password validity. The password must contain least 8 characters 
 * in length, containing at least an upper case letter, 
 * a lower case letter and a special character.
 */
export function passwordCheck(password: string) {
    if (password.length < 8) {
        return { status: false, message: "Password must be at least 8 characters long." };
    }

    if (/\s/.test(password)) {
        return { status: false, message: "Password must not contain whitespace." };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>~`\[\];'\\\-=_\+]/.test(password);

    if (!hasUpperCase) {
        return { status: false, message: "Password must contain at least one uppercase letter." };
    }
    if (!hasLowerCase) {
        return { status: false, message: "Password must contain at least one lowercase letter." };
    }
    if (!hasDigit) {
        return { status: false, message: "Password must contain at least one digit." };
    }
    if (!hasSpecialChar) {
        return { status: false, message: "Password must contain at least one special character." };
    }
    return { status: true, message: "Password is valid." };
}


interface SignupTextboxProps {
    content: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


const SignupTextbox = ({ content, value, onChange }: SignupTextboxProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px'
        }}>
            <label
            className='text-black dark:text-white'
            style={{ fontSize: '20px', marginRight: '10px', width: '175px' }}
            >
                {content}
            </label>
            <input
                style={{
                    background: isHovered ? 'linear-gradient(to right, #3f2957, #4f2968)' :
                        'linear-gradient(to right, #1f2937, #2f2948)',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    borderRadius: '10px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    width: 'calc(100% - 120px)',
                    fontSize: '17px',
                }}
                value={value}
                onChange={onChange}
                onMouseOver={() => { setIsHovered(true) }}
                onMouseLeave={() => { setIsHovered(false) }}
            />
        </div>
    )
}
export { SignupTextbox };


interface PassowrdTextboxProps {
    content: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordEnterChange?: (entering: boolean) => void;
}
const PasswordTextbox = ({ content, value, onChange, onPasswordEnterChange }: PassowrdTextboxProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
        style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px'
        }}>
            <label 
                style={{ fontSize: '20px', marginRight: '10px', width: '175px' }}
                className='text-black dark:text-white'
            >
                {content}
            </label>
            <input
                type="password"
                style={{
                    background: isHovered ? 'linear-gradient(to right, #3f2957, #4f2968)' :
                        'linear-gradient(to right, #1f2937, #2f2948)',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    borderRadius: '10px',
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    width: 'calc(100% - 120px)',
                    fontSize: '17px',
                }}
                value={value}
                onChange={onChange}
                onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => onPasswordEnterChange?.(true)}
                onBlur={() => onPasswordEnterChange?.(false)}
            />
        </div>
    )
}
export { PasswordTextbox };


/**
 * Returns a signup box
 */
const SignupBox = (): JSX.Element => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [passwordEntering, setPasswordEntering] = useState(false);
    const [catHover, setCatHover] = useState(false);
    const [formComplete, setFormComplete] = useState(false); // The completion of first form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastname] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const router = useRouter();

    // // For debug
    // useEffect(() => {
    //     if (currentUser) {
    //       alert(JSON.stringify(currentUser, null, 2));
    //     }
    //   }, [currentUser]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '75vh'
        }}>

            {/* Form part 1 */}
            {!formComplete && (
                <form style={{
                    width: '500px',
                    paddingBottom: '40px'
                }}

                    // The submit event
                    onSubmit={(e) => {
                        e.preventDefault();
                        // Check for input validity
                        if (password === repeatPassword) {

                            // Username check
                            let res = usernameCheck(username)
                            if (!res.status) {
                                alert(res.message);
                            } else {

                                // Password check
                                res = passwordCheck(password)
                                if (!res.status) {
                                    alert(res.message);

                                    // Email check
                                } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
                                    alert("Email invalid.");
                                } else {
                                    // Swap to the second form
                                    setFormComplete(true);
                                }
                            }
                        } else {
                            alert("Password do not match");
                        }
                    }}>
                    <h2 
                    style={{
                        textAlign: 'center',
                        paddingBottom: '20px',
                        fontSize: '20px',
                        fontFamily: 'monospace',
                    }}
                    className='text-black dark:text-white'
                    >
                        Ready for your next coding journey?
                    </h2>
                    <div>
                        <SignupTextbox content="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <SignupTextbox content="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <PasswordTextbox content="password" value={password} onChange={(e) => setPassword(e.target.value)} onPasswordEnterChange={setPasswordEntering} />
                        <PasswordTextbox content="repeat password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} onPasswordEnterChange={setPasswordEntering} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <SubmitButton content="Next" />
                    </div>
                </form>
            )}


            {/* Form part 2 */}
            {formComplete && (
                <div>
                    <form style={{ width: '500px' }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (firstName.trim().length === 0) {
                                alert("Invalid first name.");
                            } else if (lastName.trim().length === 0) {
                                alert("Invalid last name.")
                            } else {
                                // Signup the user to the database
                                axios.post('/api/user/signup', {
                                    username: username,
                                    password: password,
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email,
                                    phoneNumber: phoneNum,
                                    avatar: "" // Assuming avatar is optional and can be an empty string
                                }, {
                                    headers: {
                                        'Content-Type': 'application/json'
                                    }
                                }).then(response => {
                                    // Success push
                                    if (response.status === 201) {
  
                                        const userObj = {
                                            username: response.data.user.username,
                                            email: response.data.user.email,
                                            firstName: response.data.user.firstName,
                                            lastName: response.data.user.lastName
                                        }

                                        localStorage.setItem("accessToken", response.data.accessToken);
                                        localStorage.setItem("refreshToken", response.data.refreshToken);
                                        console.log("accessToken: " + localStorage.getItem("accessToken") + '\n');
                                        console.log("refreshToken: " + localStorage.getItem("refreshToken") + '\n');
                                        alert('Alright! You\'re in the game!');
                                        router.push('/');
                                    } else {
                                        alert(response.data.message);
                                    }
                                })
                                    .catch(error => {

                                        // Access the custom error message from the server
                                        if (error.response && error.response.data && error.response.data.error) {
                                            alert(error.response.data.error);
                                        } else {
                                            // Fallback to a generic error message
                                            alert('Signup failed: ' + error.message);
                                        }
                                    });
                            }
                        }}>
                        <h2 
                        style={{
                            textAlign: 'center',
                            paddingBottom: '20px',
                            fontSize: '20px',
                            fontFamily: 'monospace',
                        }}
                        className='text-black dark:text-white'
                        >
                            Just a few more questions...
                        </h2>

                        <SignupTextbox content="first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <SignupTextbox content="last name" value={lastName} onChange={(e) => setLastname(e.target.value)} />
                        <div style={{ height: '20px' }}></div>

                        <h2 style={{
                            textAlign: 'center',
                            paddingBottom: '20px',
                            fontSize: '20px',
                            fontFamily: 'monospace',
                        }}
                        className='text-black dark:text-white'
                        >
                            And some optional stuff...
                        </h2>
                        <SignupTextbox content="phone number" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />

                        {/* TODO: avatar */}

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                            <button
                                style={{
                                    marginLeft: '10px',
                                    backgroundColor: '#1f2937',
                                    color: 'white',
                                    paddingLeft: '20px',
                                    paddingRight: '20px',
                                    marginTop: '25px',
                                    height: '50px',
                                    borderRadius: '5px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '17px',
                                }}
                                onClick={() => setFormComplete(false)}>Back</button>

                            <SubmitButton content="Let's go!" />
                        </div>
                    </form>
                </div>
            )}





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
export { SignupBox };


/**
 * The page itself.
 */
export default function Page(): JSX.Element {

    const { theme } = useTheme();

    return (
        <ThemeProvider attribute="class" defaultTheme="system">
            <div 
            style={{ minHeight: '100vh', fontFamily: "Helvetica" }}
            className='bg-gray-50 dark:bg-black transition-colors'
            >
                <Header content="Signup" />
                <SignupBox />
            </div>
        </ThemeProvider>
    )
}