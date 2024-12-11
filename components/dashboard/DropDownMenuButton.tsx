// @/components/dashboard/DropDownMenuButton.tsx

import { useState } from "react";


interface DropDownMenuProps {
    content: string;
    href: string;
}

export const DropDownMenuButton = ({ content, href }: DropDownMenuProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
        color: isHovered ? 'gray' : 'white',
        textDecoration: isHovered ? 'underline' : 'none'
    }
    return (
        <>
            <div style={buttonStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
                    <a href={href || '#'}>{content}</a>
            </div>
        </>
    );
}