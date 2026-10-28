declare module "pg" {
  export interface QueryResult<Row = unknown> {
    rows: Row[];
  }

  export class PoolClient {
    query<Row = unknown>(
      queryText: string,
      values?: readonly unknown[],
    ): Promise<QueryResult<Row>>;
    release(): void;
  }

  export class Pool {
    constructor(options?: {
      connectionString?: string;
      max?: number;
      idleTimeoutMillis?: number;
      connectionTimeoutMillis?: number;
      ssl?: {
        ca: string;
        rejectUnauthorized: boolean;
      };
    });
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  const pg: { Pool: typeof Pool };
  export default pg;
}
