import { ProgramDataController } from "../../controllers/program/programData.controller.js";
import { Route } from "../../types/route.class.js";

export class ProgramDataRoute extends Route {
    protected declare controller: ProgramDataController;

    constructor() {
        super("/data", new ProgramDataController());
    }

    protected initializeRoutes() {
    }
}