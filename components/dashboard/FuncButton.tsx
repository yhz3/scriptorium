import { useState } from "react";

interface FuncButtonProps {
    content: string;
    href?: string;
    onClick: () => void; // Specify that it returns void to clarify usage
}

export const FuncButton = ({ content, href, onClick }: FuncButtonProps): JSX.Element => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
        color: isHovered ? 'gray' : 'white',
        textDecoration: isHovered ? 'underline' : 'none',
    };

    return (
        <>
            <div
                className="bg-[#1e1e1e] text-white text-[17px] border border-gray-500 px-3 py-2 rounded-md"
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