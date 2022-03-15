export interface ICustomerCaseRepository {
  find<T>(filter: any, select: any): Promise<T[]>;
  findOne<T>(filter: any, select?: any): Promise<T>;
  save<T>(body: T): Promise<T>;

  update<T>(id: string, obj: T): Promise<T>;

  delete(
    id: string
  ): Promise<{ ok?: number; n?: number } & { deletedCount?: number }>;
}
