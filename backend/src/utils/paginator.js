import constants from '../configs/constants.js';
const { ITEMS_PER_PAGE } = constants;

const paginateData = (data = [], limit = ITEMS_PER_PAGE, page = 1, q) => {
    // should validate all parameters
    if (!Array.isArray(data)) {
        throw new Error('Data must be an array');
    }
    if (limit <= 0) limit = ITEMS_PER_PAGE;
    if (page <= 0) page = 1;

    let pageResults = data;
    if (q) {
        // console.log("q has value", q);
        // Simple substring search (sub‑optimal)
        pageResults = data.filter(
            item => {
                const searchText = item.name.toLowerCase();
                const queryTerm = q.toLowerCase().trim();
                return searchText.includes(queryTerm);
            });
    };

    // implement pagination based on limit, page and q
    const totalResults = pageResults.length;
    const totalPages = Math.ceil(totalResults / limit);
    const currentPage = totalPages >= page ? page : 1;
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    if (limit <= totalResults) {
        pageResults = pageResults.slice((currentPage - 1) * limit, currentPage * limit);
    }

    return {
        totalPageResults: pageResults.length,
        pageResults,
        totalResults,
        totalPages,
        page: currentPage,
        limit,
        hasNextPage,
        hasPreviousPage
    }
}

export default paginateData;