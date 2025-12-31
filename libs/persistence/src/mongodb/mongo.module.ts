import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

@Global()
@Module({})
export class MongoModule {
  static forRoot(dbName: string, connectionName?: string): DynamicModule {
    const conn = connectionName || dbName;

    return {
      module: MongoModule,
      imports: [
        ConfigModule,
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (config: ConfigService): Promise<MongooseModuleOptions> => ({
            uri: config.get<string>(`DATABASE_URL_${dbName.toUpperCase()}`),
          }),
          inject: [ConfigService],
          connectionName: conn,
        }),
      ],
      exports: [MongooseModule],
    };
  }
}
