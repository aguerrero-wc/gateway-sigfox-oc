import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DevicesModule } from './modules/devices/devices.module';
import { SigfoxModule } from './modules/sigfox/sigfox.module';

@Module({
  imports: [
    // Configuration Module - Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Schedule Module - For cron jobs (device health monitoring)
    ScheduleModule.forRoot(),

    // Event Emitter Module - For async event-driven architecture
    EventEmitterModule.forRoot(),

    // TypeORM Module - Database connection with environment variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'postgres'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME', 'sigfox_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Connection pooling configuration
        extra: {
          max:
            configService.get<string>('NODE_ENV') === 'production' ? 100 : 20,
          min: 2,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),

    DevicesModule,

    SigfoxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
