"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatusHistory = void 0;
const typeorm_1 = require("typeorm");
const application_entity_1 = require("./application.entity");
const application_status_entity_1 = require("../../entities/master/application-status.entity");
const user_entity_1 = require("../users/user.entity");
let ApplicationStatusHistory = class ApplicationStatusHistory {
    id;
    application;
    status;
    notes;
    changedBy;
    changedAt;
};
exports.ApplicationStatusHistory = ApplicationStatusHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApplicationStatusHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => application_entity_1.Application, (application) => application.statusHistory),
    (0, typeorm_1.JoinColumn)({ name: 'application_id' }),
    __metadata("design:type", application_entity_1.Application)
], ApplicationStatusHistory.prototype, "application", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => application_status_entity_1.ApplicationStatus, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'status_id' }),
    __metadata("design:type", application_status_entity_1.ApplicationStatus)
], ApplicationStatusHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'notes' }),
    __metadata("design:type", String)
], ApplicationStatusHistory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.applicationStatusChanges, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'changed_by' }),
    __metadata("design:type", user_entity_1.User)
], ApplicationStatusHistory.prototype, "changedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'changedAt', type: 'timestamp' }),
    __metadata("design:type", Date)
], ApplicationStatusHistory.prototype, "changedAt", void 0);
exports.ApplicationStatusHistory = ApplicationStatusHistory = __decorate([
    (0, typeorm_1.Entity)('application_status_history')
], ApplicationStatusHistory);
//# sourceMappingURL=application-status-history.entity.js.map