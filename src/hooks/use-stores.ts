import React from 'react';
import { FirebaseContext } from '@components/Firebase/Firebase';

export const useStores = () => {
    const context = React.useContext(FirebaseContext);
    if (!context) {
        throw new Error('useStores must be used inside FirebaseContext.Provider');
    }
    return context.rootStore;
};