import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { environment } from '../../../../../environments/environment';

import { AuthenticationService, Credentials } from '../../../../core/authentication/authentication.service';

import { NowPlayingItem } from '../../../../core/models/shared/now-playing/now-playing-item';

import { NowPlayingRequest } from '../../../../core/models/shared/now-playing/now-playing-request';
import { NowPlayingCommandRequest } from '../../../../core/models/shared/now-playing/now-playing-command-request';

import { NowPlayingService } from '../../../../core/now-playing/now-playing.service';
import { NowPlayingResponse } from '../../../../core/models/shared/now-playing/now-playing-response';

@Component({
    selector: 'hjbv-now-playing',
    templateUrl: './now-playing.component.html',
    styleUrls: ['./now-playing.component.scss']
})
export class NowPlayingComponent implements OnInit {

    private PlayList: Array<any>;
    private connection: ISubscription;

    private authentication: AuthenticationService;
    private credentials: Credentials;

    constructor(private nowPlayingService: NowPlayingService, authentication: AuthenticationService) {
        this.PlayList = new Array<NowPlayingItem>();
        this.authentication = authentication;
        this.credentials = this.authentication.credentials;
    }

    ngOnInit() {

        let responseHook: string = NowPlayingResponse.fetchNowPlayingResponseHook(NowPlayingService.appPrefix, NowPlayingService.servicePrefix);
        this.connection = this.nowPlayingService.listen(responseHook).subscribe(npResult => {
            this.PlayList = NowPlayingResponse.FromObject(npResult).queue;
        });

        let commandRequest = new NowPlayingCommandRequest(NowPlayingCommandRequest.NPC_REFRESH);
        let nowPlayingRequest = new NowPlayingRequest(NowPlayingRequest.NP_REQUEST_COMMAND, commandRequest);
        this.nowPlayingService.talk(nowPlayingRequest);

    }

    clear() {

        let commandRequest = new NowPlayingCommandRequest(NowPlayingCommandRequest.NPC_CLEAR);
        let nowPlayingRequest = new NowPlayingRequest(NowPlayingRequest.NP_REQUEST_COMMAND, commandRequest);
        this.nowPlayingService.talk(nowPlayingRequest);

    }

}
