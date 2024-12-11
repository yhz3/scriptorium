// @/components/dashboard/DropDownMenuButton.tsx

import { useState } from "react";


interface ThemeToggleProps {
    content: string;
    href?: string;
    onClick: () => void;
}

export const ThemeToggleButton = ({ content, href, onClick }: ThemeToggleProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
        color: isHovered ? 'gray' : 'white',
        textDecoration: isHovered ? 'underline' : 'none'
    }
    return (
        <>
            <div style={buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
                >
                    <a href={href || '#'}>{content}</a>
            </div>
        </>
    );
}