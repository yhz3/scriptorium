const CONTENT_CUTOFF = 5;


interface TagCardProps {
    tag: string;
}

/**
 * Returns a singular tag card
 */
const TagCard: React.FC<TagCardProps> = ({ tag }) => {
    if (tag.length > CONTENT_CUTOFF) {
        tag = tag.slice(0, CONTENT_CUTOFF) + '...';
    }

    return (
        <span style={{
            color: 'white',
            fontSize: 12,
            backgroundColor: 'darkgray',
            paddingLeft: '5px',
            paddingRight: '5px',
            paddingTop: '3px',
            paddingBottom: '3px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            marginLeft: '5px'
        }}>{tag}</span>
    );
}

export default TagCard;