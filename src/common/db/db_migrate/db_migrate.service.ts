import {Injectable} from '@nestjs/common';
import {UserService} from "../../../api/user_modules/user/user.service";
import {AppConfigService} from "../../../api/app_config/app_config.service";
import fs from "fs";
import {join} from "path";
import root from "app-root-path";
import {newMongoObjId} from "../../../core/utils/utils";
import {IUser} from "../../../api/user_modules/user/entities/user.entity";
import {UserPrivacyTypes, UserRole} from "../../../core/utils/enums";

@Injectable()
export class DbMigrateService {

    constructor(
        private readonly userService: UserService,
        private readonly appConfigService: AppConfigService,
    ) {
        setTimeout(async () => {
            await this._startMigrate()
        }, 2500)
    }


    private async _startMigrate() {
        let rawData = fs.readFileSync(join(root.path, "package.json"), "utf8");
        let packageOfJson = JSON.parse(rawData);
        let newVersion = packageOfJson.version;
        let config = await this.appConfigService.getConfig()
        // if (newVersion.toString() != config.backendVersion.toString()) {
        //     await this._migrateFromVersion1To2(newVersion);
        // }
    }

    private async _migrateFromVersion1To2(newVersion: string) {
        await this._addUniqueIdForUsers();
        //await this._mergeBadge();
        await this._addUserPrivacy();
        let config = await this.appConfigService.getConfig();
        await this.appConfigService.insert({
            ...config,
            backendVersion: newVersion,
            _id: newMongoObjId().toString()
        });
        console.log("Done the _migrateFromVersion1To2")
    }

    private async _addUniqueIdForUsers() {
        let count = 0
        let users = await this.userService.findAll({
            uniqueCode: {$eq: null}
        }, "_id")
        for (let user of users) {
            let code = await this.generateUniqueCode();
            await this.userService.findByIdAndUpdate(user._id, {
                uniqueCode: code
            })
            count++;
        }
        console.log("uniqueCode Added for " + count)
    }

    private async generateUniqueCode(): Promise<number> {
        let uniqueCode: number;
        let isUnique = false;
        while (!isUnique) {
            uniqueCode = Math.floor(100000 + Math.random() * 900000);
            let existingUser: IUser = await this.userService.findOne({
                uniqueCode: uniqueCode
            }, "uniqueCode");

            if (!existingUser) {
                isUnique = true;
            }
        }

        return uniqueCode;
    }

    private async _mergeBadge() {
        let count = 0
        let users = await this.userService.findAll({
            hasBadge: true
        }, "_id roles")
        for (let user of users) {
            await this.userService.findByIdAndUpdate(user._id, {
                roles: [...user.roles, UserRole.HasBadge]
            })
            count++;
        }
        console.log("_mergeBadge Added for " + count)
    }

    private _addUserPrivacy = async () => {
        await this.userService.updateMany({
            userPrivacy:{$eq:null}
        }, {
            userPrivacy: {
                startChat: UserPrivacyTypes.ForReq,
                publicSearch: true,
                showStory: UserPrivacyTypes.ForReq,
                lastSeen: true,
            }
        })
        console.log("_addUserPrivacy has been added")
    }
}
