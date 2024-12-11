// @/components/dashboard/TemplateCards.tsx

const TITLE_CUTOFF = 50;
const EXPLANATION_CUTOFF = 100;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TagCard from './TagCard';
import Link from 'next/link';


interface TitleButtonProps {
  title: string;
}

export const TitleButton: React.FC<TitleButtonProps> = ({ title }) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonStyle: React.CSSProperties = {
    background: isHovered ? '#6F2DA8':'linear-gradient(to right, #411442, #311432)',
    borderTopLeftRadius: '5px', 
    borderTopRightRadius: '5px', 
    padding: '10px',
    border: "1px solid gray",
    width: '300px',
    textAlign: 'left'
  }
  return (
    <button style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >{title}</button>
  )
}

export const ForkButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
  
    const bottonStyle = {
      backgroundColor: isHovered ? '#028A0F': '#3CB043',
      paddingLeft: '30px',
      paddingRight: '30px',
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '15px',
      textAlign: 'center' as 'center',
      borderBottomLeftRadius: '5px',
      borderBottomRightRadius: '5px',
      border: "0.75px solid #3CB043",
      cursor: 'pointer',
      transition: 'background-color 0.3s ease' 
    }
  
    return (
      <button style={bottonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        Fork
      </button>
    );
  }
  
  
export const ViewForkedCopiesButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonStyle = {
      backgroundColor: isHovered ? '#2d333b': '#1b1f24',
      paddingLeft: '30px',
      paddingRight: '30px',
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '15px',
      textAlign: 'center' as 'center',
      borderBottomLeftRadius: '5px',
      borderBottomRightRadius: '5px',
      borderBottom: '1px solid gray',
      borderRight: '1px solid gray',
      borderLeft: '1px solid gray',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      float: 'right' as 'right'
    }
  
    return (
      <button style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
        View All Usage
      </button>
    )
  }


interface Template {
  id: string;
  title: string;
  explanation: string;
  authorId: string;
  tags: string;
  createdAt: string;
}


const fetchAuthorName = async (authorId: number) => {
    try {
      const response = await axios.get(`/api/user/${authorId}`);
      return response.data.username;
    } catch (error) {
      console.error('Error fetching author:', error);
      if (error instanceof Error) {
        throw new Error(`Error fetching author in @/components/dashboard/TemplateCard.tsx: ${error.message}`);
      } else {
        throw new Error('Error fetching author in @/components/dashboard/TemplateCard.tsx');
      }
    }
}

  
export const TemplateCard = ({ template }: { template: Template }) => {

  const authorId = parseInt(template.authorId);
  const [author, setAuthor] = useState<any>();
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAuthorName(authorId);
      if (data) {
        setAuthor(data);
      }
    };
    fetchData();
  }, [authorId]);


  let title = template.title;
  if (template.title.length >= TITLE_CUTOFF) {
    title = template.title.substring(0, TITLE_CUTOFF) + '...';
  }

  let explanation = template.explanation;
  if (template.explanation.length >= EXPLANATION_CUTOFF) {
    explanation = template.explanation.substring(0, EXPLANATION_CUTOFF) + '...';
  }

  let tags = template.tags;
  // TODO: implement the cut

  return (
    <div style={{ width: '300px' }}>
    <Link href={`/codeEditor/${template.id}`}>
        <TitleButton title={title} />
    </Link>

    <div style={{
      backgroundColor: '#161b22',
      paddingTop: '5px',
      paddingBottom: '5px',
      paddingLeft: '10px',
      paddingRight: '10px',
      borderLeft: '1px solid gray',
      borderRight: '1px solid gray',
      borderBottom: '1px solid gray',
      fontSize: '13px',
      color: 'lightgray'
    }}>  
      {typeof template.tags === 'string' && template.tags.length > 0 ? (
        template.tags.split(',').map((tag, index) => (
          <TagCard key={index} tag={tag} />
        ))
      ) : (
        <p>No tags</p>
      )}
    </div>

  
    <div style={{
      backgroundColor: '#161b22',
      borderLeft: '1px solid gray',
      borderRight: '1px solid gray',
      borderBottom: '1px solid gray',
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '14px'
    }}>
      {explanation}
    </div>
  
    <div style={{
      backgroundColor: '#161b22',
      borderLeft: '1px solid gray',
      borderRight: '1px solid gray',
      borderBottom: '1px solid gray',
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      fontSize: '12px',
      color: 'gray',
      borderBottomLeftRadius: '5px',
      borderBottomRightRadius: '5px' 
    }}>
      { author }, Created at { template.createdAt.split('T')[0] }
    </div>
  
    {/* <div>
      <ForkButton/>
      <ViewForkedCopiesButton/>
    </div> */}
    </div>
  )
  }
