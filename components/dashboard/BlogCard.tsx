// @/components/dashboard/BlogCard.tsx

const TITLE_CUTOFF = 100;
const DESCRIPTION_CUTOFF = 500;
const CONTENT_CUTOFF = 1000;

import { useState } from "react";
import TagCard from "./TagCard";

/**
 * The blog entity interface.
 */
interface Blog {
    id: number,
    title: string,
    description: string,
    content: string,
    tags: Array<{ id: number; name: string }>,
    rating: number,
    authorId: number
}


/**
 * The title button data interface.
 */
interface TitleButtonProps {
    blog: Blog;
}


/**
 * Returns the title button
 */
export const TitleButton: React.FC<TitleButtonProps> = ({ blog }) => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle: React.CSSProperties = {
        background: isHovered ? '#6F2DA8' : 'linear-gradient(to right, #411442, #311432)',
        // backgroundColor: isHovered ? '#6F2DA8':'#311432',
        borderTopLeftRadius: '5px',
        borderTopRightRadius: '5px',
        border: "1px solid gray",
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '20px',
        paddingRight: '100px',
        width: '600px',
        textAlign: 'left'
    }

    return (
        <button style={buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => { window.location.href = `blogs/${blog.id}` }}>
            {blog.title}
        </button>
    )
}

/**
 * Returns one blog card
 */
export const BlogCard = ({ blog }: { blog: Blog }) => {

    let title = blog.title;
    if (title.length > TITLE_CUTOFF) {
        title = blog.title.substring(0, TITLE_CUTOFF) + '...';
    }

    let description = blog.description;
    if (description.length > DESCRIPTION_CUTOFF) {
        description = blog.description.substring(0, TITLE_CUTOFF) + '...';
    }

    let content = blog.content;
    if (content.length > CONTENT_CUTOFF) {
        content = blog.content.substring(0, CONTENT_CUTOFF) + '...';
    }

    return (
        <div style={{
            width: '600px'
        }}>

            <TitleButton blog={blog} />

            <div style={{
                backgroundColor: '#161b22',
                paddingTop: '7px',
                paddingBottom: '7px',
                paddingLeft: '20px',
                borderLeft: '1px solid gray',
                borderRight: '1px solid gray',
                borderBottom: '1px solid gray',
                fontSize: '13px',
                color: 'lightgray'
            }}>{description}
            </div>

            <div style={{
                backgroundColor: '#161b22',
                paddingTop: '7px',
                paddingBottom: '7px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderLeft: '1px solid gray',
                borderRight: '1px solid gray',
                borderBottom: '1px solid gray',
                fontSize: '13px',
                color: 'lightgray',
                display: 'flex',
                justifyContent: 'space-between'
            }}>


                {/* Tags */}
                <span>
                    {(() => {
                        const validTags = blog.tags.filter(tag => tag.name && tag.name.trim() !== '');
                        return validTags.length > 0 ? (
                            validTags.map((tag) => (
                                <TagCard key={tag.id} tag={tag.name} />
                            ))
                        ) : (
                            <p className="text-gray-500" style={{ fontFamily: "monospace" }}>No tags</p>
                        );
                    })()}
                </span>


                {/* Rating */}
                <span style={{
                    borderLeft: '1px solid gray',
                    paddingLeft: '15px',
                }}>Rating: {blog.rating}</span>
            </div>


            {/* Content */}
            <div style={{
                backgroundColor: '#161b22',
                paddingTop: '7px',
                paddingBottom: '7px',
                paddingLeft: '20px',
                borderLeft: '1px solid gray',
                borderRight: '1px solid gray',
                borderBottom: '1px solid gray',
                fontSize: '12px',
                borderBottomLeftRadius: '5px',
                borderBottomRightRadius: '5px',
                fontFamily: 'monospace',
            }}>{content}
            </div>
        </div>
    )
}