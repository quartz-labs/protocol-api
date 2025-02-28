import { ProgramDataController } from "../../controllers/program/programData.controller.js";
import { Route } from "../../types/route.class.js";

export class ProgramDataRoute extends Route {
    protected declare controller: ProgramDataController;

    constructor() {
        super("/data", new ProgramDataController());
    }

    protected initializeRoutes() {
        this.router.get("/account-status", this.controller.getAccountStatus);
        this.router.get("/deposit-limits", this.controller.getDepositLimits);
        this.router.get("/spend-limits", this.controller.getSpendLimits);
    }
}