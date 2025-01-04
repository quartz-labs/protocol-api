import { App } from "./app.js";
import { DataRoute } from "./routes/data.routes.js";
import { DriftRoute } from "./routes/drift.routes.js";
import { UserRoute } from "./routes/user.routes.js";
import { BuildTransactionRoute } from "./routes/buildTransaction.routes.js";
const app = new App([
    new DataRoute(),
    new DriftRoute(),
    new UserRoute(),
    new BuildTransactionRoute(),
]);
app.listen();
//# sourceMappingURL=index.js.map