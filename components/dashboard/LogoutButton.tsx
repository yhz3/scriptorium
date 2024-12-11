import { useState } from "react";

interface LogoutButtonProps {
    content: string;
    href?: string;
    onClick: () => void; // Specify that it returns void to clarify usage
}

export const LogoutButton = ({ content, href, onClick }: LogoutButtonProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
        color: isHovered ? 'gray' : 'white',
        textDecoration: isHovered ? 'underline' : 'none',
    };

    return (
        <>
            <div
                style={buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick} // Trigger the onClick function here
            >
                {/* <a href={href || '#'}>{content}</a> */}
                <a>{content}</a>
            </div>
        </>
    );
};