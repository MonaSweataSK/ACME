import { Router } from 'express';
import { getDepartments, getDesignations, getCountries } from '../controllers/metadata.controller';

const router = Router();

router.get('/departments', getDepartments);
router.get('/designations', getDesignations);
router.get('/countries', getCountries);

export default router;
