// components/editor/Sandbox.tsx

import Editor from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface SandboxProps {
  code: string;
  language: string;
  onChangeCode: (newCode: string) => void;
}

const Sandbox: React.FC<SandboxProps> = ({ code, language, onChangeCode }) => {
  const { resolvedTheme } = useTheme(); // Use resolvedTheme to get the effective theme
  const [editorTheme, setEditorTheme] = useState('vs-dark'); // Default to dark theme

  // Map next-themes' theme to Monaco Editor's themes
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      setEditorTheme('vs-dark'); // Monaco's dark theme
    } else {
      setEditorTheme('vs-light'); // Monaco's light theme
    }
  }, [resolvedTheme]); // Update whenever resolvedTheme changes

  function handleOnChange(value?: string) {
    console.log('value', value);
    onChangeCode(value || '');
  }

  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      language={language}
      value={code}
      theme={editorTheme} // Pass dynamically updated theme
      options={{
        fontSize: 14,
        minimap: {
          enabled: false,
        },
        contextmenu: false,
      }}
      onChange={handleOnChange}
    />
  );
};

export default Sandbox;
