import { CompositeRoute } from "./compositeRoute.js";
import { SendTxRoute } from "./program/sendTx.route.js";
import { BuildTxRoute } from "./program/buildTx.route.js";
import { ProgramDataRoute } from "./program/programData.route.js";

export class ProgramRoute extends CompositeRoute {
    constructor() {
        super(
            "/program",
            [
                new SendTxRoute(),
                new BuildTxRoute(),
                new ProgramDataRoute(),
            ]
        );
    }
}
