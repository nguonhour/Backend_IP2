export declare const AUDIT_KEY = "audit";
export interface AuditMetadata {
    action: string;
    module: string;
    entityType: string;
}
export declare function Audit(metadata: AuditMetadata): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
