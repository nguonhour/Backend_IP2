import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => {
        // const dbPort = Number(process.env.DB_PORT ?? 5432);
        const databaseUrl = requireEnv('DATABASE_URL').trim();

        return {
          type: 'postgres',
          // host: process.env.DB_HOST,
          // port: Number.isNaN(dbPort) ? 5432 : dbPort,
          // username: process.env.DB_USERNAME,
          // password: process.env.DB_PASSWORD,
          // database: process.env.DB_NAME,
          // entities: [__dirname + '/**/*.entity{.ts,.js}'],
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
