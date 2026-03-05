import React from 'react'
import rootStore from '@stores'

export const useStores = () => {
    const store = React.useContext(rootStore as any);
    return store;
}