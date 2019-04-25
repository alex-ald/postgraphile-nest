import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostGraphileModule } from 'postgraphile-nest';
import { TestPlugin } from './plugins/test.plugin';

@Module({
  imports: [
    PostGraphileModule.forRoot({
      pgConfig: 'postgresql://crtd_graphile:crafteddrone1@localhost/crafteddronedb?sslmode=disable',
      playground: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TestPlugin],
})
export class AppModule {}
