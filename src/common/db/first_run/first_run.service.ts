import {Injectable} from '@nestjs/common';
import {CountriesService} from "../../../api/countries/countries.service";
import {UserService} from "../../../api/user_modules/user/user.service";
import fs from "fs";
import {join} from "path";
import root from "app-root-path";
import {AppConfigService} from "../../../api/app_config/app_config.service";
import {
    CallStatus,
    Platform,
    RegisterMethod,
    RegisterStatus,
    UserPrivacyTypes,
    UserRole
} from "../../../core/utils/enums";
import {VersionsService} from "../../../api/versions/versions.service";

import {UserGlobalCallStatus} from "../../../chat/call_modules/utils/user-global-call-status.model";
import {CallHistoryService} from "../../../chat/call_modules/call_history/call_history.service";

@Injectable()
export class FirstRunService {
    constructor(
        private readonly countriesService: CountriesService,
        private readonly userService: UserService,
        private readonly callHistoryService: CallHistoryService,
        private readonly appConfigService: AppConfigService,
        private readonly versionsService: VersionsService,
    ) {
        this._start().then(r => {
        });
    }

    private async _start() {
        // let config = await this._setConfig();
        let country = await this._addCountries()
        let lastSeen = await this._setLastVersion();
        let admin = await this._insertAdmin();
        await this._closeAllCalls();
        if (country) console.log(country)
        // if (config) console.log(config)
        if (lastSeen) console.log(lastSeen)
        if (admin) console.log(admin)
    }

    private async _addCountries() {
        let count = await this.countriesService.estimatedDocumentCount();
        if (count == 0) {
            let rawData = fs.readFileSync(join(root.path, "countries.json"), "utf8");
            let countries: [] = JSON.parse(rawData);
            await this.countriesService.createMany(countries);
            return "All countries has been inserted"
        }
    }

    private async _setConfig() {
        let oldConfig = await this.appConfigService.getConfig();
        if (!oldConfig) {
            let rawData = fs.readFileSync(join(root.path, "package.json"), "utf8");
            let packageOfJson = JSON.parse(rawData);
            await this.appConfigService.insert({
                backendVersion: packageOfJson.version
            });
            return "new config has been set version is => 1"
        }
    }

    private async _setLastVersion() {
        let oldVersion = await this.versionsService.findOne({}, null, {sort: "-_id"});
        if (!oldVersion) {
            for (const platform of Object.values(Platform)) {
                await this.versionsService.create({
                    semVer: "1.0.0",
                    critical: false,
                    notes: "first version",
                    notify: false,
                    platform: platform
                });
            }
            return "Version 1.0.0 has been insert for all platforms"
        }
    }

    private async _closeAllCalls() {
        await this.userService.updateMany({
            'userGlobalCallStatus.callerId': {$ne: null}
        }, {userGlobalCallStatus: UserGlobalCallStatus.createEmpty()});
        await this.callHistoryService.updateMany({
            callStatus: CallStatus.Ring,
        },{
            callStatus: CallStatus.ServerRestart,
        })

    }

    private async _insertAdmin() {
        let model = this.userService;
        let admin = await model.findOne({
            email: "admin@admin.com"
        }, null)
        if (!admin) {
            await model.create({
                email: "admin@admin.com",
                password: "admin",
                fullName: "Admin",
                registerMethod: RegisterMethod.email,
                fullNameEn: "Admin",

                roles: [UserRole.Admin, UserRole.Prime],
                registerStatus: RegisterStatus.accepted,
                verifiedAt: new Date(),
                uniqueCode: 100000,
                userPrivacy: {
                    startChat: UserPrivacyTypes.ForReq,
                    publicSearch: false,
                    showStory: UserPrivacyTypes.ForReq,
                    lastSeen: false,
                }
            })
            return "Super Admin admin@admin.com with password admin has been created !"
        }
    }
}
