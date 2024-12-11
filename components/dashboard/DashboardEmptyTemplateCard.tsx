// @/components/dashboard/DashboardEmptyTemplateCard.tsx
import { useState } from "react";


export const AddButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const bottonStyle: React.CSSProperties = {
        backgroundColor: isHovered? '#161b22' : '#1b1f24',
        padding: '40px',
        textAlign: 'center',
        borderBottomLeftRadius: '5px',
        borderBottomRightRadius: '5px',
        width: '100%',
        borderLeft: '1px solid gray',
        borderRight: '1px solid gray',
        borderBottom: '1px solid gray'
    }
    return (
        <button style={bottonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => window.location.href = '/codeEditor/new'}>
            +
        </button>
    )
}


/**
 * Displayed as a card, where there is no card
 */
export default function DashboardEmptyIcon(): JSX.Element {
    return (
        <div style={{ width: '300px' }}>
            <div style={{
                backgroundColor: "#161b22",
                padding: '10px',
                textAlign: 'center',
                borderTopLeftRadius: '5px',
                borderTopRightRadius: '5px',
                border: '1px solid gray',
                width: '100%'
                }}>
            There is currently no template.
            </div>
            <AddButton />
        </div>
    )
}