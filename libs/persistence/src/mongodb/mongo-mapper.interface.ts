/**
 * MongoDB mapper contract.
 * Maps between domain aggregates and Mongo persistence models.
 */
export interface MongoMapper<Aggregate, DbModel> {
  toPersistence(entity: Aggregate): Partial<DbModel>;
  toDomain(raw: any): Aggregate;
}
