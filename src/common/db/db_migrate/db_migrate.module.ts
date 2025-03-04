import { Module } from '@nestjs/common';
import { DbMigrateService } from './db_migrate.service';
import {UserModule} from "../../../api/user_modules/user/user.module";
import {MessageModule} from "../../../chat/message/message.module";
import {AppConfigModule} from "../../../api/app_config/app_config.module";
import {AdminPanelModule} from "../../../api/admin_panel/admin_panel.module";
@Module({
  providers: [DbMigrateService],
  imports:[
      UserModule,
      MessageModule,
      AppConfigModule,
      AdminPanelModule
  ]
})
export class DbMigrateModule {}
