import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostGraphileModule } from 'postgraphile-nest';
import { TestPlugin } from './plugins/test.plugin';

@Module({
  imports: [
    PostGraphileModule.forRoot({
      pgConfig: 'postgresql://alexald@localhost/crafteddronedb?sslmode=disable',
      schema: 'graphile_test',
      playground: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TestPlugin],
})
export class AppModule {}
