// CurrentUserContext.tsx
import { createContext, ReactNode, useState, useContext } from "react";

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

const defaultUser: User = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
};
export {defaultUser};

interface UserContextType {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
}

interface Props {
  children: ReactNode;
}

const CurrentUserContext = createContext<UserContextType>({
  currentUser: defaultUser,
  setCurrentUser: () => {},
});
export { CurrentUserContext };

const CurrentUserProvider: React.FC<Props> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(defaultUser);

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};
export default CurrentUserProvider;


export function getCurrentUser() {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


// export default CurrentUserProvider;
// interface AuthContextTypes {
//   user: User | null;
//   login: (username: string, password: string) => Promise<void>;
//   signup: (userData: User) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextTypes | undefined>(undefined);

// export function AuthProvider({ children }: Props) {
//   const [user, setUser] = useState<User | null>(null);

//   const login = async (username: string, password: string) => {
//     // Implement login logic
//   };

//   const signup = async (userData: User) => {
//     // Implement signup logic
//   };

//   const logout = () => {
//     // Implement logout logic
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, signup, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }