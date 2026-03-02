//src/routes/providerRoute.ts
import { Router } from "express";
import providerControler from "../controllers/providerController";
import { validate } from "../middleware/validate" 
import auth from "../middleware/auth";


const router = Router();

router.use(auth('PROVIDER'));

router.get('/assigned-request', providerControler.listAssignedRequest)


export default router;