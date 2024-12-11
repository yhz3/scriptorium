import React, { useState, useContext, useEffect } from 'react';
import "tailwindcss/tailwind.css";
import { Header } from '.';
// import { AuthProvider } from '@/context/UserContext';
import { ModifyProfileButton } from '@/components/profile/ModifyProfileButton';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
//import { ModifyProfileCard } from '@/components/profile/ModifyProfileCard';
import { SubmitProfileModificationButton } from '@/components/profile/SubmitProfileModificationButton';
import { ThemeProvider } from 'next-themes';
import { getCurrentUser } from '@/context/CurrentUserContext';


export function UserInfo(): JSX.Element {
    const [modifyClicked, setModifyClicked] = useState(false);
    // const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
    // let username = currentUser.username;

    // // For debug
    // useEffect(() => {
    //     if (currentUser) {
    //       alert(JSON.stringify(currentUser, null, 2));
    //     }
    //   }, [currentUser]); 
    const { currentUser } = getCurrentUser();
    console.log(JSON.stringify(currentUser));

    return (
        <div>

            {/* If the button is not clicked -> Info display */}
            {!modifyClicked && (<div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '75vh',
            }}>
                {/* INSERT NAME */}
                <div style={{
                    paddingTop: '20px',
                    fontSize: '30px',
                    fontFamily: 'monospace',
                }}
                className='text-black dark:text-white'>Hello, there,</div>

                <br />

                <div style={{
                    fontSize: '20px',
                    fontFamily: 'monospace',
                    paddingBottom: '20px'
                }}
                className='text-black dark:text-white'>How are we doing today?</div>

                <hr style={{
                    width: '40%',
                    borderTop: '0.5px solid darkgray',
                    paddingBottom: '50px'
                }} />

                <UserProfileCard username={currentUser.username} />
                <div style={{ paddingBottom: '20px' }}></div>
                <ModifyProfileButton content='Modify My Profile' onClick={() => window.location.href = '/modifyProfile'} />
            </div>)}
        </div>
    )
}



export default function Page(): JSX.Element {
    return (
        <ThemeProvider attribute="class" defaultTheme="system">
            <div>
                <Header content="Profile" />
                <UserInfo />
            </div>
        </ThemeProvider>
    )
}
