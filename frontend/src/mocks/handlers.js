import { http, HttpResponse } from 'msw'
import { fetchItemsURL } from '../apis/items'
import { fetchStatsURL } from '../apis/stats'

const items = [
    {
        "id": 1,
        "name": "Macbook Pro 16 (2025)",
        "category": "Electronics",
        "price": 3699
    },
    {
        "id": 2,
        "name": "Iphone 17 Pro Max",
        "category": "Electronics",
        "price": 1299
    },
    {
        "id": 3,
        "name": "Samsung Galaxy S25",
        "category": "Electronics",
        "price": 1199
    }
]

export const handlers = [
    http.get(fetchItemsURL, () => {
        const result = {
            pageResults: items,
            page: 1,
            hasNextPage: false
        }
        return HttpResponse.json(result, { status: 200 })
    }),
    http.get(fetchStatsURL, () => {
        return HttpResponse.json({
            "total": 3,
            "averagePrice": 2362.33
        }, { status: 200 })
    }),
    http.get(`${fetchItemsURL}/:id`, ({ params }) => {
        // console.log("params", params);
        return HttpResponse.json(items[params.id - 1], { status: 200 })
    })
]

