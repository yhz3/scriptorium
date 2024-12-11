import React, { useState, useEffect } from 'react';
import "tailwindcss/tailwind.css";

import { Header } from '.';

export default function Page() {
    return (
        <div  style={{ backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: "Helvetica"}}>
            <Header content="About"/>
            <div style={{
                fontSize: '20px',
                paddingLeft: '50px',
                paddingTop: '50px'
            }}>
                
            <h1 style={{
                fontSize: '25px'
            }}>Scriptorium</h1>

            <hr style={{ borderColor: 'gray', marginRight: "50px", marginTop: '20px' }} />
                
            <p style={{ marginTop: '20px'}}>Scriptorium is an original CSC309 project, made by Chenxu (Robin) Mao, Ethan Cheung and Colin Walton.
                <br/>
                It is a online IDE that allows user to execute code, share blogs and code templates.
            </p>

            <button className="px-4 py-2 bg-gray-300 text-black hover:bg-gray-500 rounded"
                style={{ marginTop: '50px'}}
                onClick={() => window.location.href = '/'}
            >
                Back
            </button>
            </div>
        </div>
    )
}