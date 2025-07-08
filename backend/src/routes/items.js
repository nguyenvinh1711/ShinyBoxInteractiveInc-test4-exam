// * Refactored routers, which focus on using middleware and controller to handle requests
import { Router } from 'express';
import itemsController from '../controllers/items.js';
import { validateRequest } from '../middleware/requestValidator.js';
import { createItemSchema, queryItemSchema, getItemSchema } from '../zod-schemas/items.js';
import { validateExistingItem } from '../middleware/validateItems.js';


const router = Router();

/**
 // ! Temporary unused    
// Utility to read data (intentionally sync to highlight blocking issue)
// changed to async to fix the blocking issue
function readData() {
    const raw = readFileSync(DATA_PATH);
    return JSON.parse(raw);
} */


// GET /api/items
router.get('/',
    validateRequest(queryItemSchema, 'query'),
    itemsController.listItems);

// GET /api/items/:id
router.get('/:id',
    validateRequest(getItemSchema, 'params'),
    itemsController.getItemById);

// POST /api/items
router.post('/',
    validateRequest(createItemSchema, 'body'),
    validateExistingItem,
    itemsController.createItem);


export default router;