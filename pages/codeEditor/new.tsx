// pages/codeEditor/new.tsx

import React, { useState, useEffect } from 'react';
import CodeEditorPage from '../../components/editor/CodeEditorPage';
import { Header } from '..';
import { User } from '../../types/user';
import axios from 'axios';

const NewCodeEditor: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                const response = await axios.get('/api/user/me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setCurrentUser(response.data.user);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        }
    };

    return (
        <>
            <Header content="Code Editor" />
            <CodeEditorPage
                template={null}
                currentUser={currentUser}
                isNewTemplate={true}
            />
        </>
    );
};

export default NewCodeEditor;
