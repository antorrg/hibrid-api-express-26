# Architectural Rules and Guidelines

## Responsibilities of Services vs Repositories

### Service Layer
- **Domain logic and orchestration**: All business logic, validations, defaults, and data preparation must reside in the Service.
- **Entity formation and ID generation**: Generating entity identities (e.g., `UuidHandler.createUuid()`) and shaping entity objects to be persisted is strictly the responsibility of the `Service`, never the `Repository`.
- **Side effects and coordination**: External operations (e.g., storage image consumption, deletion/preservation, emails, logging) belong in the Service layer.

### Repository Layer
- **Persistence only**: Repositories must NOT form entity objects, assign business defaults, or generate IDs.
- **Pure database interaction**: The Repository receives already-formed entity data/payloads and executes database queries, transactions, or ORM operations.
- **Mapping**: The Repository delegates mapping between raw database records/models and DTOs to dedicated parsers (e.g., `ProductParser`, `VariantParser`).
