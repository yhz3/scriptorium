// Import necessary modules and components
import React from 'react';
import Image from "next/image";
import { Header } from '.';
import axios from 'axios';
import { useRouter } from 'next/router';

// Import user avatars
import avatar_1 from "@/resources/images/avatars/avatar_1.png";
import avatar_2 from "@/resources/images/avatars/avatar_2.png";
import avatar_3 from "@/resources/images/avatars/avatar_3.png";
import avatar_4 from "@/resources/images/avatars/avatar_4.png";
import avatar_5 from "@/resources/images/avatars/avatar_5.png";
import avatar_6 from "@/resources/images/avatars/avatar_6.png";
import { useTheme } from 'next-themes';

// Title Component
function Title(): JSX.Element {
    // Styles Object for Inline Styling

    const { resolvedTheme } = useTheme(); // Get the current theme ('light' or 'dark')

    const styles = {
        title: {
            fontSize: '40px',
            textAlign: 'center' as const,
            justifyContent: 'center',
            marginTop: '30px',
        },
        avatarContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
            maxWidth: '600px',
            margin: '0 auto',
        },
        avatarButton: {
            background: 'none',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            margin: '10px',
        },
        avatarImage: {
            borderRadius: '50%',
            border: `5px solid ${resolvedTheme === 'light' ? 'black' : 'white'}`,
            transition: 'transform 0.3s ease',
        },
    };

    return (
        <div className='text-black dark:text-white' style={styles.title}>
            Fancy a new profile pic?
        </div>
    );
}

// Function to submit the new profile picture
async function submitNewPfp(avatar_id: string): Promise<void> {
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            throw new Error('Access token not found.');
        }

        // Fetch current user data
        const response = await axios.get('/api/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = response.data.user;

        // Prepare request body with updated avatar
        const reqBody = {
            avatar: avatar_id
        };

        // Update user profile with new avatar
        await axios.put('/api/user/me', reqBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

    } catch (err: any) {
        console.error('Error updating profile picture:', err);
        alert('Failed to update profile picture. Please try again.');
    }
}

// AvatarSelectionBody Component
export function AvatarSelectionBody(): JSX.Element {
    const router = useRouter();

    const { resolvedTheme } = useTheme(); // Get the current theme ('light' or 'dark')

    const styles = {
        title: {
            fontSize: '40px',
            textAlign: 'center' as const,
            justifyContent: 'center',
            marginTop: '30px',
        },
        avatarContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
            maxWidth: '600px',
            margin: '0 auto',
        },
        avatarButton: {
            background: 'none',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
            margin: '10px',
        },
        avatarImage: {
            borderRadius: '50%',
            border: `5px solid ${resolvedTheme === 'light' ? 'black' : 'white'}`,
            transition: 'transform 0.3s ease',
        },
    };


    // Array of avatar objects for dynamic rendering
    const avatars = [
        { id: "1", src: avatar_1 },
        { id: "2", src: avatar_2 },
        { id: "3", src: avatar_3 },
        { id: "4", src: avatar_4 },
        { id: "5", src: avatar_5 },
        { id: "6", src: avatar_6 },
    ];

    // Handler for avatar selection
    const handleAvatarClick = async (avatar_id: string) => {
        await submitNewPfp(avatar_id);
        router.push('/profile'); // Navigate to profile after successful update
    };

    return (
        <div style={styles.avatarContainer}>
            {avatars.map(avatar => (
                <button
                    key={avatar.id}
                    onClick={() => handleAvatarClick(avatar.id)}
                    style={styles.avatarButton}
                >
                    <Image
                        src={avatar.src}
                        alt={`Avatar ${avatar.id}`}
                        width={175}
                        height={175}
                        style={styles.avatarImage}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                </button>
            ))}
        </div>
    );
}

// Main Page Component
export default function Page() {
    return (
        <>
            <Header content="Profile" />
            <Title />
            <AvatarSelectionBody />
        </>
    );
}
