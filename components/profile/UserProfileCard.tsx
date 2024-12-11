// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProfileInfoBlock } from './ProfileInfoBlock';
import Image from 'next/image';
import { useRouter } from 'next/router';

// Import all the avatars
import avatar_1 from "@/resources/images/avatars/avatar_1.png";
import avatar_2 from "@/resources/images/avatars/avatar_2.png";
import avatar_3 from "@/resources/images/avatars/avatar_3.png";
import avatar_4 from "@/resources/images/avatars/avatar_4.png";
import avatar_5 from "@/resources/images/avatars/avatar_5.png";
import avatar_6 from "@/resources/images/avatars/avatar_6.png";

// Define TypeScript interfaces
interface UserProfile {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatar: string;
}

interface UserProfileCardProps {
    username: string;
}

// Define an array of avatar images for easy mapping
const avatars = [
    { id: '1', src: avatar_1 },
    { id: '2', src: avatar_2 },
    { id: '3', src: avatar_3 },
    { id: '4', src: avatar_4 },
    { id: '5', src: avatar_5 },
    { id: '6', src: avatar_6 },
];

export function UserProfileCard({ username }: UserProfileCardProps): JSX.Element {
    // Initialize state variables
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter(); // Initialize Next.js router

    // Fetch user data when component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');

                if (!accessToken) {
                    throw new Error('Access token not found.');
                }

                const response = await axios.get('/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const user: UserProfile = response.data.user;
                setUserData(user);
            } catch (err: any) {
                console.error('Error fetching user data:', err);
                setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

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

    // Handle case where userData is not available
    if (!userData) {
        return (
            <div style={styles.errorContainer}>
                <p>No user data available.</p>
            </div>
        );
    }

    // Determine the avatar to display based on userData.avatar
    const currentAvatar = avatars.find(avatar => avatar.id === userData.avatar) || avatars[0];

    return (
        <div style={styles.cardContainer}>
            {/* Avatar Section */}
            <div style={styles.avatarContainer}>
                <button
                    onClick={() => router.push('/selectAvatar')}
                    style={styles.avatarButton}
                    aria-label="Change Profile Picture"
                >
                    <Image
                        src={currentAvatar.src}
                        alt={`Avatar ${currentAvatar.id}`}
                        width={175}
                        height={175}
                        style={styles.avatarImage}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                </button>
            </div>

            {/* User Information Section */}
            <div style={styles.infoContainer}>
                <ProfileInfoBlock content="Username" data={userData.username || 'Not registered'} />
                <ProfileInfoBlock content="Email" data={userData.email || 'Not registered'} />
                <ProfileInfoBlock content="First Name" data={userData.firstName || 'Not registered'} />
                <ProfileInfoBlock content="Last Name" data={userData.lastName || 'Not registered'} />
                <ProfileInfoBlock content="Phone Number" data={userData.phoneNumber || 'Not registered'} />
            </div>
        </div>
    );
}

// Define styles outside of the component for better readability and maintainability
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
        justifyContent: 'space-around',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    avatarContainer: {
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarButton: {
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
    },
    avatarImage: {
        borderRadius: '50%',
        border: '5px solid white',
        transition: 'transform 0.3s ease',
    },
    infoContainer: {
        flex: '2',
        paddingLeft: '50px',
        color: 'white',
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