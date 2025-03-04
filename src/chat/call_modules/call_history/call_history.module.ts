import {Module} from '@nestjs/common';
import {CallHistoryService} from './call_history.service';
import {MongooseModule} from "@nestjs/mongoose";
import {CallHistorySchema} from "./call.history.entity";

@Module({

    providers: [CallHistoryService],
    exports: [CallHistoryService],
    imports: [
        MongooseModule.forFeature([{
            name: "call_history",
            schema: CallHistorySchema
        }]),
    ]
})
export class CallHistoryModule {
}
