// Type declarations for libraries without TypeScript types

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
