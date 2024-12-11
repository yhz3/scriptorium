// @/pages/index.tsx
import React, { useState, useEffect, useContext, MouseEventHandler } from 'react';
import "tailwindcss/tailwind.css";
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import DashboardEmptyIcon from '@/components/dashboard/DashboardEmptyTemplateCard';
import BlogEmptyCard from '@/components/dashboard/DashboardEmptyBlogCard';
import { BlogCard } from '@/components/dashboard/BlogCard';
import { DropDownMenuButton } from '@/components/dashboard/DropDownMenuButton';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import axios from 'axios';
import { FuncButton } from '@/components/dashboard/FuncButton';
import { ThemeContext } from '@/context/ThemeContext';
import { ThemeToggleButton } from '@/components/dashboard/ThemeToggle';
import { ThemeProvider, useTheme } from 'next-themes';

const EXPLORE_TEMPLATES_CUTOFF = 8;
const EXPLORE_BLOGS_CUTOFF = 8;


/**
 * Header
 */
interface HeaderProps {
  content: string;
}


/*
Calls logout API to invalidate the refreshToken and removes the accessToken and refreshToken from
localStorage. Once logged out, we refresh the current window the user is on instead of taking them
to the home page.
*/
function handleLogout() {

  console.log("handleLogout triggered");

  axios.post('/api/user/logout', {
    refreshToken: localStorage.getItem("refreshToken"),
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
    }
  }).then(response => {
    // Successful log out
    if (response.status === 200) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      console.log("Log out successful.");
      console.log(`accessToken: ${localStorage.getItem("accessToken")}`);
      console.log(`refreshToken: ${localStorage.getItem("refreshToken")}`);
      alert('See you next time!');
      window.location.href = '/';
    } else {
      alert(response.data.message);
    }
  }).catch(error => {
    console.log("Issue with axios api call");
    // Access the custom error message from the server
    if (error.response && error.response.data && error.response.data.error) {
      alert(error.response.data.error);
    } else {
      // Fallback to a generic error message
      alert('Log out failed: ' + error.message);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = '/';    
  });
}

export function Header({ content }: HeaderProps): JSX.Element {
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Toggle the hamburger menu
  const toggleHamburgerMenu = () => {
    setHamburgerMenuOpen(!hamburgerMenuOpen);
  }

  // const changeTheme = () => {
  //   if (theme === "1e1e1e") {
  //     setTheme("fff6ec");
  //   } else {
  //     setTheme("1e1e1e");
  //   }
  //   console.log(`new theme: ${theme}`);
  // };

  const [isHovered, setIsHovered] = useState(false);
  const buttonStyle = {
      color: isHovered ? 'gray' : 'white',
      textDecoration: isHovered ? 'underline' : 'none',
  };

  return (
    <header
      id="header"
      className="flex justify-between items-center p-4 relative"
      style={{
        borderBottom: '1px solid gray',
        background: 'linear-gradient(to right, #161b22, #261b32)'
      }}>
      <div className="flex items-center">
        <button onClick={toggleHamburgerMenu} className="hamburger-menu">
          <span
            style={{
              color: 'gray',
              fontSize: '30px',
              border: '1px solid lightgray',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '5px',
              fontFamily: 'Arial',
            }}> ≡
          </span>
        </button>
        <div className="ml-4">
            <span style={{ color: 'lightgray', fontSize: '20px', display: 'flex', alignItems: 'center' }}>
              <DropDownMenuButton content="Scriptorium" href='/' />: {content}
            </span>
        </div>
      </div>
      <div className="flex space-x-4">
        <ThemeToggleButton content="Light / Dark" onClick={() => {
          setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
          console.log(theme);
        }}/>
        <DropDownMenuButton content="Never Give Up" href="https://www.youtube.com/watch?v=KxGRhd_iWuE" />
        <DropDownMenuButton content="Try Me" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
      </div>
      {hamburgerMenuOpen && (
        <div
          style={{
            zIndex: 10, // Keeps the open menu on the top layer even when in the code editor
            fontSize: '15px',
            color: 'white',
            position: 'absolute',
            top: '100%',
            left: '10px',
            width: '15%',
            background: 'linear-gradient(to bottom, #1f2937, #1f2947)',
            opacity: 0.975,
            padding: '1rem',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            borderTop: '1px solid gray',
            borderBottomRightRadius: '10px',
            borderBottomLeftRadius: '10px',
            borderRight: '1px solid gray',
            borderBottom: '1px solid gray',
            borderLeft: '1px solid gray'
          }}>
          <div className="flex flex-col space-y-2">

            {localStorage.getItem("accessToken") !== null ? (
              // If the user is logged in, return profile
              <DropDownMenuButton content="Profile" href='/profile' />
            )
              :
              (
                // If the user is not logged in, return signup/login option
                <div className="flex space-x-2">
                  <DropDownMenuButton content="Signup " href="/signup" />
                  <div>/</div> <DropDownMenuButton content="Login" href='/login' />
                </div>
              )}

            {/* Rest of the drop down menu */}
            <DropDownMenuButton content="Discover Templates" href="/templates/" />
            <DropDownMenuButton content="Discover Blogs" href="/blogs" />
            <DropDownMenuButton content="Code Editor" href="/codeEditor/new" />

            {localStorage.getItem("accessToken") !== null ? (
              // If the user is logged in, return profile
              <LogoutButton content="Log Out" href='/' onClick={handleLogout} />
            )
              :
              (
                // If the user is not logged in, return nothing
                <div className="flex space-x-2">
                </div>
              )}

          </div>
        </div>
      )}
    </header>
  );
}


/**
 * Fetch the template data from the database.
 */
const fetchTemplates = async (): Promise<any[]> => {
  try {
    const response = await axios.get('/api/templates');
    const templates = response.data.templates.slice(0, EXPLORE_TEMPLATES_CUTOFF);
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching templates in @/pages/index.tsx: ${error.message}`);
    } else {
      throw new Error('Error fetching templates in @/pages/index.tsx');
    }
  }
};


/**
 * Returns JSX Componenets of the template section.
 */
export function Templates(): JSX.Element {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchTemplates(); // Replace with your actual fetch logic
      if (data) {
        setTemplates(data);
      }
    };

    // Fetch data initially
    fetchData();

    // Set up interval to fetch data every 5 seconds
    const interval = setInterval(() => {
      console.log("Fetching templates...");
      fetchData();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const { theme } = useContext(ThemeContext);

  var themeContrast;

  if (theme === '1e1e1e') {
    themeContrast = 'fff6ec';
  } else {
    themeContrast = '161b22';
  }

  return (
    <>
      <h1 
      style={{ 
        fontSize: "20px", 
        marginLeft: "30px", 
        marginTop: "15px",
      }}
      className='text-black dark:text-white'
      >
        Explore Templates
      </h1>

      <div id="template-grid" className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{
          fontSize: "15px",
          marginLeft: "40px",
          marginTop: "15px",
          marginRight: "40px",
        }}>

        {/* Cards */}
        {Array.isArray(templates) && templates.length > 0 ? (
          templates.map((template: any) => (
            <TemplateCard key={template.id} template={template} />
          ))
        ) : (
          <DashboardEmptyIcon />
        )}
        {/* Cards */}

      </div>
    </>
  );
}


/**
 * Fetch blogs data from the db.
 */
const fetchBlogs = async (): Promise<any[]> => {
  try {
    const response = await axios.get('/api/blogs');
    const blogs = response.data.blogs.slice(0, EXPLORE_BLOGS_CUTOFF);
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    if (error instanceof Error) {
      throw new Error(`Error fetching blogs in @/pages/index.tsx: ${error.message}`);
    } else {
      throw new Error('Error fetching blogs in @/pages/index.tsx');
    }
  }
}


/**
 * Blog Section
 */
export function Blogs(): JSX.Element {
  const [blogs, setBlogs] = useState<any[]>();

  useEffect(() => {
    const fetchBlogData = async () => {
      const data = await fetchBlogs();
      if (data) {
        setBlogs(data);
      }
    };
    fetchBlogData();

    const interval = setInterval(() => {
      console.log("Fetching blogs...");
      fetchBlogData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <h1 
      style={{ 
        fontSize: "20px", 
        marginLeft: "30px", 
        marginTop: "15px",
      }}
      className='text-black dark:text-white'
      >
        Explore Blogs
      </h1>
      <div id="blog-grid" className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4"
        style={{
          fontSize: "15px",
          marginLeft: "40px",
          marginTop: "15px",
          marginRight: "40px"
        }}>

        {/* Cards */}
        {Array.isArray(blogs) && blogs.length > 0 ? (
          blogs.map((blog: any) => (
            <BlogCard key={blog.id} blog={blog} />
          ))
        ) : (
          <BlogEmptyCard />
        )}
        {/* Cards */}

      </div>
    </>
  )
}


/**
 * Returns the footer.
 */
export function Footer(): JSX.Element {
  return (
    <div style={{
      fontSize: '10px',
      color: 'darkgray',
      paddingLeft: '20px',
      paddingRight: '20px',
      paddingBottom: '20px',
      textAlign: 'right'
    }}>Scriptorium, 2024. An original CSC309 project.
      <p>Made with love from Chenxu (Robin) Mao, Ethan Cheung, Colin Walton.</p>
    </div>
  )
}

/**
 * The main body.
 */
export default function Page(): JSX.Element {

  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <div className={`flex flex-col min-h-screen bg-gray-50 dark:bg-black transition-colors}`}
        style={{ minHeight: '100vh', fontFamily: "Helvetica" }}>
        <Header content="Dashboard" />
        <main className="flex-grow">
          <Templates />
          <div style={{ height: '50px' }}></div>
          <Blogs />
          <div style={{ height: '30px' }}></div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}