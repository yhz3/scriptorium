// components/TemplateList.tsx

import React from 'react';
import { Template } from '../../types/template';
import TemplateCard from './TemplateCard';

interface TemplateListProps {
  templates: Template[];
}

const TemplateList: React.FC<TemplateListProps> = ({ templates }) => {
  if (templates.length === 0) {
    return <p 
    style={{
        fontFamily: 'monospace',
        fontSize: '17px',
        textAlign: 'center',
        marginTop: '20vh'
    }}
    className='text-black dark:text-white'>
      No templates found.
    </p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 text-black dark:text-white ">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
};

export default TemplateList;
