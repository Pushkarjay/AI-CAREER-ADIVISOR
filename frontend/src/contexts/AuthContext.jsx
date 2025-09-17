import React, { createContext, useContext, useState } from 'react';import React, { createContext, useContext, useState } from 'react';import React, { createContext, useContext, useState, useEffect } from 'react';import React, { createContext, useContext, useState, useEffect } from 'react';



const AuthContext = createContext({});



export const useAuth = () => {const AuthContext = createContext({});import toast from 'react-hot-toast';import toast from 'react-hot-toast';

  return useContext(AuthContext);

};



export const AuthProvider = ({ children }) => {export const useAuth = () => {

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);  return useContext(AuthContext);



  const login = async (email, password) => {};const AuthContext = createContext({});const AuthContext = createContext({});

    setLoading(true);

    setTimeout(() => {

      setUser({ email, name: email.split('@')[0] });

      setLoading(false);export const AuthProvider = ({ children }) => {

    }, 1000);

  };  const [user, setUser] = useState(null);



  const logout = () => {  const [loading, setLoading] = useState(false);export const useAuth = () => {export const useAuth = () => {

    setUser(null);

  };



  const signup = async (email, password) => {  const login = async (email, password) => {  const context = useContext(AuthContext);  const context = useContext(AuthContext);

    return login(email, password);

  };    setLoading(true);



  return (    // Mock login for development  if (!context) {  if (!context) {

    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>

      {children}    setTimeout(() => {

    </AuthContext.Provider>

  );      setUser({ email, name: email.split('@')[0] });    throw new Error('useAuth must be used within an AuthProvider');    throw new Error('useAuth must be used within an AuthProvider');

};
      setLoading(false);

    }, 1000);  }  }

  };

  return context;  return context;

  const logout = () => {

    setUser(null);};};

  };



  const signup = async (email, password) => {

    return login(email, password);export const AuthProvider = ({ children }) => {export const AuthProvider = ({ children }) => {

  };

  const [user, setUser] = useState(null);  const [user, setUser] = useState(null);

  return (

    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>  const [loading, setLoading] = useState(false);  const [loading, setLoading] = useState(false);

      {children}

    </AuthContext.Provider>

  );

};  // Mock authentication for development  // Mock authentication for development

  useEffect(() => {  useEffect(() => {

    const savedUser = localStorage.getItem('mockUser');    // Simulate checking for existing session

    if (savedUser) {    const savedUser = localStorage.getItem('mockUser');

      setUser(JSON.parse(savedUser));    if (savedUser) {

    }      setUser(JSON.parse(savedUser));

    setLoading(false);    }

  }, []);    setLoading(false);

  }, []);

  const signup = async (email, password) => {

    try {  const signup = async (email, password) => {

      setLoading(true);    try {

      await new Promise(resolve => setTimeout(resolve, 1000));      setLoading(true);

            // Mock signup - in real app this would call Firebase

      const mockUser = {      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        uid: 'mock-user-id',      

        email: email,      const mockUser = {

        displayName: email.split('@')[0],        uid: 'mock-user-id',

        photoURL: null        email: email,

      };        displayName: email.split('@')[0],

              photoURL: null

      setUser(mockUser);      };

      localStorage.setItem('mockUser', JSON.stringify(mockUser));      

      toast.success('Account created successfully!');      setUser(mockUser);

      return { user: mockUser };      localStorage.setItem('mockUser', JSON.stringify(mockUser));

    } catch (error) {      toast.success('Account created successfully!');

      toast.error(error.message || 'Failed to create account');      return { user: mockUser };

      throw error;    } catch (error) {

    } finally {      toast.error(error.message || 'Failed to create account');

      setLoading(false);      throw error;

    }    } finally {

  };      setLoading(false);

    }

  const login = async (email, password) => {  };

    try {

      setLoading(true);  const login = async (email, password) => {

      await new Promise(resolve => setTimeout(resolve, 1000));    try {

            setLoading(true);

      const mockUser = {      // Mock login - in real app this would call Firebase

        uid: 'mock-user-id',      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        email: email,      

        displayName: email.split('@')[0],      const mockUser = {

        photoURL: null        uid: 'mock-user-id',

      };        email: email,

              displayName: email.split('@')[0],

      setUser(mockUser);        photoURL: null

      localStorage.setItem('mockUser', JSON.stringify(mockUser));      };

      toast.success('Logged in successfully!');      

      return { user: mockUser };      setUser(mockUser);

    } catch (error) {      localStorage.setItem('mockUser', JSON.stringify(mockUser));

      toast.error(error.message || 'Failed to log in');      toast.success('Logged in successfully!');

      throw error;      return { user: mockUser };

    } finally {    } catch (error) {

      setLoading(false);      toast.error(error.message || 'Failed to log in');

    }      throw error;

  };    } finally {

      setLoading(false);

  const logout = async () => {    }

    try {  };

      setLoading(true);

      setUser(null);  const logout = async () => {

      localStorage.removeItem('mockUser');    try {

      toast.success('Logged out successfully!');      setLoading(true);

    } catch (error) {      setUser(null);

      toast.error(error.message || 'Failed to log out');      localStorage.removeItem('mockUser');

      throw error;      toast.success('Logged out successfully!');

    } finally {    } catch (error) {

      setLoading(false);      toast.error(error.message || 'Failed to log out');

    }      throw error;

  };    } finally {

      setLoading(false);

  const value = {    }

    user,  };

    loading,

    signup,  const value = {

    login,    user,

    logout,    loading,

  };    signup,

    login,

  return (    logout,

    <AuthContext.Provider value={value}>  };

      {children}

    </AuthContext.Provider>  return (

  );    <AuthContext.Provider value={value}>

};      {children}
    </AuthContext.Provider>
  );
};