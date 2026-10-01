# Security Specification for Firestore Rules

## 1. Data Invariants
1. **Default Deny**: Any path not explicitly matched is denied all reads and writes.
2. **Authentication Gate**: All write and read operations to workshop data (`cups`, `orders`, `movements`, `pricingTiers`, `customers`) require authenticated users (`request.auth != null`).
3. **ID Hardening**: All document ID path variables (`cupId`, `orderId`, `movementId`, `tierId`, `customerId`) must adhere to safe identifier patterns (`isValidId()`, length <= 128, characters `^[a-zA-Z0-9_\\-]+$`).
4. **Data Integrity & Schema Conformance**: All writes must conform to strict type and size boundaries:
   - String fields must be length-constrained (<= 500 chars, notes <= 2000 chars)
   - Numbers must not be negative where impossible (stock >= 0, quantity > 0, prices >= 0)
   - Enums must only be among authorized values (e.g. `productionStatus`, `movementType`, `sablonSides`)
5. **SPK State Machine Integrity**: Production status transitions must not allow tampering by arbitrary clients or invalid status values.
6. **No Client Query Delegation**: Collection queries are explicitly guarded and limited to authenticated workshop personnel.

## 2. The Dirty Dozen Payloads (Intended to Break Invariants)
1. **Anonymous / Unauthenticated Read**: Unauthenticated request attempting `GET /orders/SPK-001` -> REJECTED.
2. **Anonymous / Unauthenticated Write**: Unauthenticated request attempting `POST /cups/cup-1` -> REJECTED.
3. **Ghost Fields Injection**: Adding arbitrary fields like `{ isAdmin: true, bypassPayment: true }` to `CustomerOrder` -> REJECTED.
4. **ID Poisoning Attack**: Trying to write document with 2000-character malicious path ID -> REJECTED by `isValidId()`.
5. **Negative Stock Quantity Attack**: Writing `stockPcs: -50000` to a `CupProduct` -> REJECTED.
6. **Negative Price Exploit**: Writing `totalPrice: -100000` to an order to create a refund exploit -> REJECTED.
7. **Invalid Production Status Exploit**: Writing `productionStatus: 'COMPLETED_FREE_OF_CHARGE'` -> REJECTED (enum validation).
8. **Invalid Sablon Sides Exploit**: Writing `sablonSides: '10 Sisi Ultra'` -> REJECTED (enum validation).
9. **Denial of Wallet Payload**: Storing a 2MB base64 string in `notes` or `customInkNotes` -> REJECTED (size limit check).
10. **Zero or Negative Quantity SPK**: Creating an order with `quantityPcs: 0` or `-100` -> REJECTED.
11. **Tampering with Immutable Order Number**: Updating an existing order's `orderNumber` to duplicate or overwrite another SPK -> REJECTED.
12. **Tampering with Stock Movement Type**: Setting `type: 'MAGIC_INJECTION'` -> REJECTED.

## 3. Test Runner
All payloads tested against rule evaluation must return `PERMISSION_DENIED`.
