import { Loading } from 'react-daisyui';

export default function Spinner(props) {
    return (
        <Loading size="lg" color="success" variant="spinner" className="mt-10" {...props}>Loading...</Loading>
    );
}