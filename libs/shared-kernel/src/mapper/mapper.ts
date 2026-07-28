export interface Mapper<TEntity, TModel> {
  toPersistence(entity: TEntity): TModel;
  toDomain(model: TModel): TEntity;
}
