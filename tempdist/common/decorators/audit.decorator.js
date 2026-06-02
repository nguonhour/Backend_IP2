"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUDIT_KEY = void 0;
exports.Audit = Audit;
const common_1 = require("@nestjs/common");
exports.AUDIT_KEY = 'audit';
function Audit(metadata) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.AUDIT_KEY, metadata));
}
//# sourceMappingURL=audit.decorator.js.map