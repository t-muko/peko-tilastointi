import React from 'react';

interface FirebaseContextType {
    rootStore: any;
}

const FirebaseContext = React.createContext<FirebaseContextType | null>(null);

export default FirebaseContext;