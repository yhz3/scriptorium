// components/templates/TemplateCard.tsx

import React from 'react';
import Link from 'next/link';
import { Template } from '../../types/template';

interface TemplateCardProps {
    template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
    return (
        <div className="border p-4 rounded shadow">
            <Link href={`/codeEditor/${template.id}`}>
                <h2 className="text-xl font-bold hover:text-blue-500">{template.title}</h2>
            </Link>
            <p className="text-gray-600">{template.explanation}</p>
            <div className="mt-2 flex flex-wrap">
                {template.tags.map((tag) => (
                    <span
                        key={tag.id}
                        className="text-sm bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-2 rounded"
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
            <div className="mt-2">
                <span className="font-semibold">Language:</span> {template.language.toUpperCase()}
            </div>
        </div>
    );
};

export default TemplateCard;
