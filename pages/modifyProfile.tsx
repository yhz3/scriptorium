// ModifyProfileCard.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Header } from '.';

// Import all the avatars
import avatar_1 from "@/resources/images/avatars/avatar_1.png";
import avatar_2 from "@/resources/images/avatars/avatar_2.png";
import avatar_3 from "@/resources/images/avatars/avatar_3.png";
import avatar_4 from "@/resources/images/avatars/avatar_4.png";
import avatar_5 from "@/resources/images/avatars/avatar_5.png";
import avatar_6 from "@/resources/images/avatars/avatar_6.png";

import { passwordCheck } from './signup';
interface ModifyProfileBlockProps {
    content: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    readOnly?: boolean;
}

const ModifyProfileBlock: React.FC<ModifyProfileBlockProps> = ({ content, value, onChange, readOnly = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={styles.inputContainer}>
            <label style={styles.label}>{content}</label>
            <input
                style={{
                    ...styles.input,
                    background: isHovered
                        ? 'linear-gradient(to right, #3f2957, #4f2968)'
                        : 'linear-gradient(to right, #1f2937, #2f2948)',
                    cursor: readOnly ? 'not-allowed' : 'pointer',
                }}
                value={value}
                onChange={onChange}
                onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                readOnly={readOnly}
            />
        </div>
    );
};

interface ModifyPasswordBlockProps {
    content: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ModifyPasswordBlock: React.FC<ModifyPasswordBlockProps> = ({ content, value, onChange }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={styles.inputContainer}>
            <label style={styles.label}>{content}</label>
            <input
                type="password"
                style={{
                    ...styles.input,
                    background: isHovered
                        ? 'linear-gradient(to right, #3f2957, #4f2968)'
                        : 'linear-gradient(to right, #1f2937, #2f2948)',
                }}
                value={value}
                onChange={onChange}
                onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </div>
    );
};

const ModifyProfileCard: React.FC = () => {
    // State variables for user data
    const [userData, setUserData] = useState<{
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        avatar: string;
    } | null>(null);

    // State variables for form inputs
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNum, setPhoneNum] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    // State variables for loading and error handling
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');

                if (!accessToken) {
                    throw new Error('Access token not found. Please log in.');
                }

                const response = await axios.get('/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const user = response.data.user;

                setUserData(user);
                setEmail(user.email);
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setPhoneNum(user.phoneNumber || '');
            } catch (err: any) {
                console.error('Error fetching user data:', err);
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    /**
     * Handles form submission with validation and API call.
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validation
        if (!userData) {
            alert("User data is not loaded.");
            return;
        }

        // Email validation
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            alert("Invalid email address.");
            return;
        }

        if (firstName.trim().length === 0) {
            alert("First name cannot be empty.");
            return;
        }

        if (lastName.trim().length === 0) {
            alert("Last name cannot be empty.");
            return;
        }

        if (password || repeatPassword) { // Only validate password if user is changing it
            if (password !== repeatPassword) {
                alert("Passwords do not match.");
                return;
            }

            if (!passwordCheck(password)) {
                alert("Password is invalid. Must be at least 6 characters and include both letters and numbers.");
                return;
            }
        }

        // Prepare data for update
        const updateData: any = {
            email,
            firstName,
            lastName,
            phoneNumber: phoneNum,
        };

        if (password) {
            // The password is hashed at endpoint
            updateData.password = password;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('Access token not found. Please log in.');
            }

            const response = await axios.put('/api/user/me', updateData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setUserData(response.data.user);
            alert("Profile updated successfully.");

            // Redirect to profile page
            window.location.href = '/profile';

            // Optionally, reset password fields
            setPassword('');
            setRepeatPassword('');
        } catch (err: any) {
            console.error('Failed to update profile:', err);
            alert(err.response?.data?.message || 'Failed to update profile. Please try again.');
        }
    };

    /**
     * Renders the profile picture section.
     * Note: Profile picture is not editable here.
     */
    const renderProfilePicture = () => {
        if (!userData) return null;

        // Map avatar IDs to their corresponding images
        const avatarMap: { [key: string]: any } = {
            '1': avatar_1,
            '2': avatar_2,
            '3': avatar_3,
            '4': avatar_4,
            '5': avatar_5,
            '6': avatar_6
        };

        const currentAvatar = avatarMap[userData.avatar] || avatarMap['1']; // Default to avatar_1 if not found

        return (
            <div style={styles.imageContainer}>
                <Image
                    src={currentAvatar}
                    alt="Profile Picture"
                    width={150}
                    height={150}
                    style={styles.profileImage}
                />
            </div>
        );
    };

    // Handle loading state
    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <p>Loading user data...</p>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div style={styles.cardContainer}>
            {renderProfilePicture()}
            <div style={styles.formContainer}>
                <form onSubmit={handleSubmit}>
                    {/* Username (Read-Only) */}
                    <ModifyProfileBlock
                        content="Username"
                        value={userData?.username || ''}
                        onChange={() => { /* No action needed since it's read-only */ }}
                        readOnly={true}
                    />

                    {/* Editable Fields */}
                    <ModifyProfileBlock
                        content="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <ModifyProfileBlock
                        content="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <ModifyProfileBlock
                        content="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <ModifyProfileBlock
                        content="Phone Number"
                        value={phoneNum}
                        onChange={(e) => setPhoneNum(e.target.value)}
                    />
                    <ModifyPasswordBlock
                        content="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <ModifyPasswordBlock
                        content="Repeat Password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                    />

                    {/* Submit Button */}
                    <button type="submit" style={styles.submitButton}>Update Profile</button>
                </form>
            </div>
        </div>
    );
};

/**
 * Styling object for inline styles.
 */
const styles: { [key: string]: React.CSSProperties } = {
    cardContainer: {
        border: '1px solid gray',
        borderRadius: '10px',
        height: '600px',
        width: '800px',
        display: 'flex',
        alignItems: 'center',
        padding: '40px',
        background: 'linear-gradient(to right, #161b22, #261b52)',
        justifyContent: 'space-between',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        textAlign: 'center'
    },
    imageContainer: {
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        borderRadius: '50%',
        border: '5px solid white',
    },
    formContainer: {
        flex: '2',
        paddingLeft: '50px',
        color: 'white',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
    },
    label: {
        color: 'lightgray',
        fontSize: '15px',
        marginRight: '10px',
        width: '175px',
    },
    input: {
        paddingLeft: '10px',
        paddingRight: '10px',
        borderRadius: '10px',
        paddingTop: '5px',
        paddingBottom: '5px',
        width: 'calc(100% - 185px)', // Adjusted for label width
        fontSize: '15px',
        border: 'none',
        color: 'white',
    },
    submitButton: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#4f2968',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        cursor: 'pointer',
        fontSize: '16px',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px',
        width: '800px',
        background: 'linear-gradient(to right, #161b22, #261b52)',
        color: 'white',
        fontSize: '1.5rem',
    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '600px',
        width: '800px',
        background: 'linear-gradient(to right, #161b22, #261b52)',
        color: 'red',
        fontSize: '1.5rem',
    },
};

export { ModifyProfileCard };


export default function Page() {
    return (
        <>
            <Header content="Profile"/>
            <div style={{ alignItems: 'center' }}>
                <ModifyProfileCard/>
            </div>
        </>
    )
}