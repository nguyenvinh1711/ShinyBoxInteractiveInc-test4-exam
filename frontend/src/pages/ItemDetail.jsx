import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAbortableFetch from '../hooks/useAbortableFetch';
import Spinner from '../components/Spinner';
import { Card, Button, Kbd } from 'react-daisyui';
import ShinyBoxLogo from '../assets/ShinyBoxLogo.png';
import { ArrowGoBackFill } from '../components/ui/ArrowGoBackFill';
import { useErrorBoundary } from 'react-error-boundary';

const API_URL = process.env.REACT_APP_API_URL;

function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showBoundary } = useErrorBoundary();

    /**
    // ! Temporary unused
    const [item, setItem] = useState(null);
    setItem(data);
    useEffect(() => {
        fetch('/api/items/' + id)
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(setItem)
            .catch(() => navigate('/'));
    }, [id, navigate]);
    */


    // * Use custom hook useAbortableFetch to fetch data
    const { data, isLoading, error } = useAbortableFetch(`${API_URL}/api/items/${id}`);
    const item = data || {};

    if (isLoading) return <Spinner />;
    if (error) showBoundary(error);

    return (
        item.name && !isNaN(item.price) ? (
            <Card className="max-h-[80%] bg-gray-800 p-5 my-5" >
                <Card.Image src={ShinyBoxLogo} alt="ShinyBoxLogo" className="rounded-2xl" />

                <Card.Body className="p-3">
                    <Card.Title className="text-white self-center">{item.name}</Card.Title>
                    <p className="text-blue-500">{item.category.toUpperCase()}</p>
                    <div className="text-yellow-500">Price: ${item.price.toFixed(2)}</div>
                    <Card.Actions className="justify-center">
                        <Button color="info" onClick={() => navigate('/')}>
                            <ArrowGoBackFill />
                            Back</Button>
                    </Card.Actions>
                </Card.Body>


            </Card >
        ) :
            (
                <Card className="max-h-[80%] bg-gray-800 p-5 my-5" >
                    <Card.Image src={ShinyBoxLogo} alt="ShinyBoxLogo" className="rounded-2xl" />

                    <Card.Body className="p-3">
                        <Kbd className="text-gray-500">Invalid item data</Kbd>
                    </Card.Body>
                </Card >
            )
    );
}

export default ItemDetail;