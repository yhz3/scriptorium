import React from "react";

const ProfileInfoBlock = ({ content, data }: { content: string, data: string }) => {
    return (
        <>
            <span style={{
                color: 'lightgray',
                fontSize: '17px'
            }}>{content}: </span>
            <span style={{
                color: 'white',
                fontSize: '17px',
                fontFamily: 'monospace',
                marginLeft: '10px'
            }}>{data}</span>
            <br/>
        </>
    );
}

export { ProfileInfoBlock };