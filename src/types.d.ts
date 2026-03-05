// Type declarations for libraries without TypeScript types

declare module 'firebase/compat/app' {
    import firebase from 'firebase/compat/app';
    export default firebase;
}

declare module 'firestorter' {
    export function initFirestorter(options: { firebase: any }): void;
    export class Collection {
        constructor(path?: string, options?: any);
        docs: any[];
        query: any;
        ref: any;
        path: string;
        isLoading: boolean;
        add(data: any): Promise<any>;
    }
    export class Document {
        constructor(path?: string, options?: any);
        id: string;
        path: string;
        data: any;
        set(data: any, options?: any): Promise<void>;
        update(data: any): Promise<void>;
        delete(): Promise<void>;
    }
}

declare module 'react-google-charts' {
    import { ComponentType } from 'react';
    export const Chart: ComponentType<any>;
}

declare module 'material-ui/TextField' {
    const TextField: any;
    export default TextField;
}

declare module 'material-ui/Divider' {
    const Divider: any;
    export default Divider;
}

declare module 'material-ui/CircularProgress' {
    const CircularProgress: any;
    export default CircularProgress;
}
