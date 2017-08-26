import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from "rxjs/Subscription";

import { environment } from '../../../../../../environments/environment';
import { AuthenticationService, Credentials } from '../../../../../core/authentication/authentication.service';

import { NowPlayingItem } from '../../../../../core/models/shared/now-playing/now-playing-item';

import { NowPlayingRequest } from '../../../../../core/models/shared/now-playing/now-playing-request';
import { NowPlayingCommandRequest } from '../../../../../core/models/shared/now-playing/now-playing-command-request';

import { NowPlayingService } from '../../../../../core/now-playing/now-playing.service';

@Component({
    selector: 'hjbv-now-playing-item',
    templateUrl: './now-playing-item.component.html',
    styleUrls: ['./now-playing-item.component.scss']
})
export class NowPlayingItemComponent implements OnInit {

    @Input()
    item: NowPlayingItem;
    @Input()
    index: number;
    private credentials: Credentials;

    constructor(private nowPlayingService: NowPlayingService, authentication: AuthenticationService) {
        this.credentials = authentication.credentials;
    }

    ngOnInit() {
        this.item = NowPlayingItem.FromObject(this.item);
    }

    upVote(index: number) {

        console.log(this.index);

        let commandRequest = new NowPlayingCommandRequest(NowPlayingCommandRequest.NPC_VOTE, this.item.getId());
        let nowPlayingRequest = new NowPlayingRequest(NowPlayingRequest.NP_REQUEST_COMMAND, commandRequest);
        this.nowPlayingService.talk(nowPlayingRequest);

    }

    downVote(index: number) {

        console.log(index);

        let commandRequest = new NowPlayingCommandRequest(NowPlayingCommandRequest.NPC_DOWNVOTE, this.item.getId());
        let nowPlayingRequest = new NowPlayingRequest(NowPlayingRequest.NP_REQUEST_COMMAND, commandRequest);
        this.nowPlayingService.talk(nowPlayingRequest);

    }

}
