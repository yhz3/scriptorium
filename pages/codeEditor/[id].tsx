// pages/codeEditor/[id].tsx

import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import CodeEditorPage from '../../components/editor/CodeEditorPage';
import { Header } from '..';
import { User } from '../../types/user';

const CodeEditorWithId: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [template, setTemplate] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        if (id) {
            fetchTemplate();
            fetchCurrentUser();
        }
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const response = await axios.get(`/api/templates/${id}`);
            setTemplate(response.data.template);
        } catch (error) {
            console.error('Error fetching template:', error);
        }
    };

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

    if (!template) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header content="Code Editor" />
            <CodeEditorPage
                template={template}
                currentUser={currentUser}
                isNewTemplate={false}
            />
        </>
    );
};

export default CodeEditorWithId;
